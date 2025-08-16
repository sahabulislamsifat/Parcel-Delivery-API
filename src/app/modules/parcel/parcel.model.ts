import { model, Schema, Types } from "mongoose";
import { IParcel, IParcelStatusLog, ParcelStatus } from "./parcel.interface";

const parcelStatusLogSchema = new Schema<IParcelStatusLog>(
  {
    status: { type: String, enum: Object.values(ParcelStatus), required: true },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: Types.ObjectId, ref: "User", required: true },
    location: { type: String },
    note: { type: String },
  },
  { _id: false }
);

const parcelSchema = new Schema<IParcel>(
  {
    trackingId: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    weight: { type: Number, required: true },
    price: { type: Number, required: true },
    deliveryCharge: { type: Number, required: true },
    sender: { type: Types.ObjectId, ref: "User", required: true },
    receiver: { type: Types.ObjectId, ref: "User", required: true },
    senderAddress: { type: String, required: true },
    receiverAddress: { type: String, required: true },
    deliveryDate: { type: Date },
    status: {
      type: String,
      enum: Object.values(ParcelStatus),
      default: ParcelStatus.REQUESTED,
    },
    statusLogs: { type: [parcelStatusLogSchema], default: [] },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Parcel = model<IParcel>("Parcel", parcelSchema);
