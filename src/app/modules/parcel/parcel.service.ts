import { Types } from "mongoose";
import { DeliveryChargeService } from "../deliveryCharge/deliveryCharge.service";
import { IParcel, ParcelStatus } from "./parcel.interface";
import { Parcel } from "./parcel.model";
import AppError from "../../errorHelper/AppError";
import httpStatus from "../../utils/httpStatus";

// Generate unique trackingId
const generateTrackingId = (): string => {
  const random = Math.floor(100000 + Math.random() * 900000);
  const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
  return `TRK-${date}-${random}`;
};

// ✅ Allowed status transitions
const VALID_STATUS_TRANSITIONS: Record<ParcelStatus, ParcelStatus[]> = {
  [ParcelStatus.REQUESTED]: [ParcelStatus.APPROVED, ParcelStatus.CANCELLED],
  [ParcelStatus.APPROVED]: [ParcelStatus.DISPATCHED, ParcelStatus.CANCELLED],
  [ParcelStatus.DISPATCHED]: [ParcelStatus.IN_TRANSIT, ParcelStatus.CANCELLED],
  [ParcelStatus.IN_TRANSIT]: [ParcelStatus.DELIVERED, ParcelStatus.RETURNED],
  [ParcelStatus.DELIVERED]: [], // Final
  [ParcelStatus.CANCELLED]: [], // Final
  [ParcelStatus.RETURNED]: [], // Final
};

const createParcel = async (payload: Partial<IParcel>): Promise<IParcel> => {
  payload.trackingId = generateTrackingId();
  payload.status = ParcelStatus.REQUESTED;

  // Calculate dynamic fee
  if (!payload.fee) {
    payload.fee = await DeliveryChargeService.calculateFee(
      payload.receiverAddress as string, // district
      payload.type as string, // parcel type
      payload.weight as number // parcel weight
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

const getAllParcels = async (): Promise<IParcel[]> => {
  return Parcel.find().populate("sender receiver");
};

const getParcelsBySender = async (senderId: string): Promise<IParcel[]> => {
  return Parcel.find({ sender: senderId }).populate("receiver");
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

  // ✅ Validate allowed transition
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

export const ParcelService = {
  createParcel,
  getAllParcels,
  getParcelsBySender,
  getParcelsByReceiver,
  getParcelByTrackingId,
  updateParcelStatus,
  deleteParcel,
};
