import z from "zod";
import { ParcelStatus, ParcelType } from "./parcel.interface";

export const createParcelValidationSchema = z.object({
  type: z.nativeEnum(ParcelType),
  weight: z.number().positive().min(0.1),
  price: z.number().nonnegative(),
  receiver: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid receiver ID format"),
  senderAddress: z.string().min(1).max(500),
  receiverAddress: z.string().min(1).max(500),
  deliveryDate: z.union([z.string().datetime(), z.date()]).optional(),
  isFragile: z.boolean().optional(),
  notes: z.string().max(1000).optional(),
});

export const updateParcelValidationSchema = z.object({
  type: z.nativeEnum(ParcelType).optional(),
  weight: z.number().positive().min(0.1).optional(),
  price: z.number().positive().optional(),
  senderAddress: z.string().min(1).max(500).optional(),
  receiverAddress: z.string().min(1).max(500).optional(),
  deliveryDate: z.union([z.string().datetime(), z.date()]).optional(),
  status: z.nativeEnum(ParcelStatus).optional(),
});

export const updateParcelStatusValidationSchema = z.object({
  status: z.nativeEnum(ParcelStatus),
  note: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
});

export const blockParcelValidationSchema = z.object({
  block: z.boolean(),
  reason: z.string().max(500).optional(),
});

export const paymentValidationSchema = z.object({
  isPaid: z.boolean(),
  paymentMethod: z.string().min(1).max(50).optional(),
});

export const assignDriverValidationSchema = z.object({
  driverId: z.string().min(24).max(24),
});

export const ParcelValidation = {
  createParcelValidationSchema,
  updateParcelValidationSchema,
  updateParcelStatusValidationSchema,
  blockParcelValidationSchema,
  paymentValidationSchema,
  assignDriverValidationSchema,
};
