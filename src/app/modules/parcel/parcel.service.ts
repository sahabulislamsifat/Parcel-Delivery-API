import { Types } from "mongoose";
import { DeliveryChargeService } from "../deliveryCharge/deliveryCharge.service";
import { IParcel, ParcelStatus } from "./parcel.interface";
import { Parcel } from "./parcel.model";
import { QueryBuilder } from "../../utils/QueryBuilder";
import AppError from "../../errorHelper/AppError";
import httpStatus from "../../utils/httpStatus";

// Generate unique trackingId
const generateTrackingId = (): string => {
  const random = Math.floor(100000 + Math.random() * 900000);
  const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
  return `TRK-${date}-${random}`;
};

// Allowed status transitions
const VALID_STATUS_TRANSITIONS: Record<ParcelStatus, ParcelStatus[]> = {
  [ParcelStatus.REQUESTED]: [ParcelStatus.APPROVED, ParcelStatus.CANCELLED],
  [ParcelStatus.APPROVED]: [ParcelStatus.DISPATCHED, ParcelStatus.CANCELLED],
  [ParcelStatus.DISPATCHED]: [ParcelStatus.IN_TRANSIT, ParcelStatus.CANCELLED],
  [ParcelStatus.IN_TRANSIT]: [ParcelStatus.DELIVERED, ParcelStatus.RETURNED],
  [ParcelStatus.DELIVERED]: [],
  [ParcelStatus.CANCELLED]: [],
  [ParcelStatus.RETURNED]: [],
};

const createParcel = async (payload: Partial<IParcel>): Promise<IParcel> => {
  payload.trackingId = generateTrackingId();
  payload.status = ParcelStatus.REQUESTED;

  payload.sender = new Types.ObjectId(payload.sender as string);

  if (!payload.deliveryCharge) {
    payload.deliveryCharge = await DeliveryChargeService.calculateFee(
      payload.receiverAddress as string,
      payload.type as string,
      payload.weight as number
    );
  }

  payload.statusLogs = [
    {
      status: ParcelStatus.REQUESTED,
      updatedBy: payload.sender as Types.ObjectId,
      timestamp: new Date(),
    },
  ];

  return Parcel.create(payload);
};

const getAllParcels = async (
  query: Record<string, unknown>
): Promise<IParcel[]> => {
  const parcelQuery = new QueryBuilder(
    Parcel.find().populate("sender receiver"),
    query
  )
    .search(["trackingId", "type", "status"])
    .filter()
    .sort()
    .paginate();
  return await parcelQuery.exec();
};

const getParcelsBySender = async (senderId: string): Promise<IParcel[]> => {
  return Parcel.find({ sender: new Types.ObjectId(senderId) })
    .populate("receiver")
    .exec();
};

const getParcelsByReceiver = async (receiverId: string): Promise<IParcel[]> => {
  return Parcel.find({ receiver: receiverId }).populate("sender");
};

const getParcelByTrackingId = async (
  trackingId: string
): Promise<IParcel | null> => {
  return Parcel.findOne({ trackingId }).populate("sender receiver");
};

const updateParcelStatus = async (
  parcelId: string,
  status: ParcelStatus,
  updatedBy: Types.ObjectId,
  note?: string,
  location?: string
): Promise<IParcel | null> => {
  const parcel = await Parcel.findById(parcelId);
  if (!parcel) throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");

  const currentStatus = parcel.status;
  const allowedNextStatuses = VALID_STATUS_TRANSITIONS[currentStatus];
  if (!allowedNextStatuses.includes(status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Invalid status transition: ${currentStatus} → ${status}`
    );
  }

  parcel.status = status;
  parcel.statusLogs.push({
    status,
    updatedBy,
    timestamp: new Date(),
    note,
    location,
  });
  await parcel.save();
  return parcel;
};

const deleteParcel = async (parcelId: string): Promise<IParcel | null> => {
  return Parcel.findByIdAndDelete(parcelId);
};

const blockUnblockParcel = async (
  parcelId: string,
  block: boolean
): Promise<IParcel | null> => {
  const parcel = await Parcel.findById(parcelId);
  if (!parcel) throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");

  parcel.isBlocked = block;
  await parcel.save();
  return parcel;
};

export const ParcelService = {
  createParcel,
  getAllParcels,
  getParcelsBySender,
  getParcelsByReceiver,
  getParcelByTrackingId,
  updateParcelStatus,
  deleteParcel,
  blockUnblockParcel,
};
