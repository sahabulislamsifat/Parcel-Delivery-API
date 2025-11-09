// import { model, Schema, Types } from "mongoose";
// import {
//   IParcel,
//   IParcelStatusLog,
//   ParcelStatus,
//   ParcelType,
// } from "./parcel.interface";

// const parcelStatusLogSchema = new Schema<IParcelStatusLog>({
//   status: { type: String, enum: Object.values(ParcelStatus), required: true },
//   updatedBy: { type: Types.ObjectId, ref: "User", required: true },
//   timestamp: { type: Date, default: Date.now },
//   location: String,
//   note: String,
// });

// const parcelSchema = new Schema<IParcel>(
//   {
//     trackingId: { type: String, required: true, unique: true },
//     sender: { type: Types.ObjectId, ref: "User", required: true },
//     receiver: { type: Types.ObjectId, ref: "User", required: true },
//     senderAddress: { type: String, required: true },
//     receiverAddress: { type: String, required: true },
//     type: { type: String, enum: Object.values(ParcelType), required: true },
//     weight: { type: Number, required: true, min: 0.1 },
//     price: { type: Number, required: true, min: 0 },
//     deliveryCharge: { type: Number, required: true, min: 0 },
//     totalAmount: { type: Number, required: true, min: 0 },
//     deliveryDate: { type: Date },
//     isPaid: { type: Boolean, default: false },
//     paymentMethod: { type: String },
//     status: {
//       type: String,
//       enum: Object.values(ParcelStatus),
//       default: ParcelStatus.REQUESTED,
//     },
//     isBlocked: { type: Boolean, default: false },
//     assignedDriver: { type: Schema.Types.ObjectId, ref: "User" },
//     actualDeliveryDate: { type: Date },
//     statusLogs: { type: [parcelStatusLogSchema], default: [] },
//   },
//   {
//     timestamps: true,
//     toJSON: {
//       virtuals: true,
//       transform(_doc, ret) {
//         return ret;
//       },
//     },
//   }
// );

// parcelSchema.index({ sender: 1 });
// parcelSchema.index({ receiver: 1 });
// parcelSchema.index({ status: 1 });
// parcelSchema.index({ createdAt: -1 });
// parcelSchema.index({ isBlocked: 1 });

// export const Parcel = model<IParcel>("Parcel", parcelSchema);

import { model, Schema, Types } from "mongoose";
import {
  IParcel,
  IParcelStatusLog,
  ParcelStatus,
  ParcelType,
} from "./parcel.interface";

const parcelStatusLogSchema = new Schema<IParcelStatusLog>({
  status: { type: String, enum: Object.values(ParcelStatus), required: true },
  updatedBy: { type: Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, default: Date.now },
  location: String,
  note: String,
});

const parcelSchema = new Schema<IParcel>(
  {
    trackingId: { type: String, required: true, unique: true },
    sender: { type: Types.ObjectId, ref: "User", required: true },
    receiver: { type: Types.ObjectId, ref: "User", required: true },
    senderAddress: { type: String, required: true },
    receiverAddress: { type: String, required: true },
    type: { type: String, enum: Object.values(ParcelType), required: true },
    weight: { type: Number, required: true, min: 0.1 },
    price: { type: Number, required: true, min: 0 },
    deliveryCharge: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    deliveryDate: { type: Date },
    isPaid: { type: Boolean, default: false },
    paymentMethod: { type: String },
    status: {
      type: String,
      enum: Object.values(ParcelStatus),
      default: ParcelStatus.REQUESTED,
    },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    assignedDriver: { type: Schema.Types.ObjectId, ref: "User" },
    actualDeliveryDate: { type: Date },
    statusLogs: { type: [parcelStatusLogSchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        return ret;
      },
    },
  }
);

// Indexes
parcelSchema.index({ sender: 1 });
parcelSchema.index({ receiver: 1 });
parcelSchema.index({ status: 1 });
parcelSchema.index({ createdAt: -1 });
parcelSchema.index({ isBlocked: 1 });

export const Parcel = model<IParcel>("Parcel", parcelSchema);
