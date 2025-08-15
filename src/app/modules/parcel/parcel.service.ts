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

  if (
    parcel.status === ParcelStatus.DISPATCHED ||
    parcel.status === ParcelStatus.DELIVERED
  ) {
    if (status === ParcelStatus.CANCELLED) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Cannot cancel dispatched or delivered parcel"
      );
    }
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
