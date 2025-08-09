import { model, Schema } from "mongoose";
import { IUser, Role, UserStatus, AuthProviderType } from "./user.interface";

// subSchema for address
const addressSchema = new Schema(
  {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    district: { type: String, trim: true },
    postalCode: { type: String, trim: true },
  },
  { _id: false }
);

// subSchema for authProviders
const authProviderSchema = new Schema(
  {
    provider: {
      type: String,
      enum: Object.values(AuthProviderType),
      required: true,
    },
    providerId: { type: String, required: true },
    email: { type: String },
  },
  { _id: false }
);

// Main User Schema
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
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
      default: Role.SENDER,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
    address: addressSchema,
    authProviders: {
      type: [authProviderSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const User = model<IUser>("User", userSchema);
