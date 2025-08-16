import { Types } from "mongoose";
import { IUser } from "../user/user.interface";

export enum ParcelStatus {
  REQUESTED = "REQUESTED",
  APPROVED = "APPROVED",
  DISPATCHED = "DISPATCHED",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  RETURNED = "RETURNED",
}

export interface IParcelStatusLog {
  status: ParcelStatus;
  timestamp: Date;
  updatedBy: Types.ObjectId | IUser["_id"];
  location?: string;
  note?: string;
}

export interface IParcel {
  _id?: string;
  trackingId: string;
  type: string;
  weight: number;
  price: number;
  deliveryCharge: number;
  sender: Types.ObjectId | IUser["_id"];
  receiver: Types.ObjectId | IUser["_id"];
  senderAddress: string;
  receiverAddress: string;
  deliveryDate?: Date;
  status: ParcelStatus;
  statusLogs: IParcelStatusLog[];
  isBlocked?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
