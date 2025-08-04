import { model, Schema } from "mongoose";
import { IsActive, IUser, Role } from "./user.interface";

const addressSchema = new Schema(
  {
    street: { type: String },
    city: { type: String },
    district: { type: String },
    postalCode: { type: String },
  },
  { _id: false }
);

const authProviderSchema = new Schema({
  provider: { type: String, required: true },
  providerId: { type: String, required: true },
});

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.SENDER, // default user
    },
    status: {
      type: String,
      enum: Object.values(IsActive),
      default: IsActive.ACTIVE,
    },
    address: addressSchema,
    authProvider: [authProviderSchema],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

export const User = model<IUser>("User", userSchema);
