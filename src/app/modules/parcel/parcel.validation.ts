import z from "zod";
import { ParcelStatus, ParcelType } from "./parcel.interface";

export const createParcelValidationSchema = z.object({
  type: z.nativeEnum(ParcelType, {
    message: "Invalid parcel type",
  }),
  weight: z
    .number()
    .positive("Weight must be positive")
    .min(0.1, "Weight must be at least 0.1 kg"),
  price: z
    .number()
    .positive("Price must be positive")
    .min(0, "Price cannot be negative"),
  receiver: z
    .string()
    .min(1, "Receiver ID is required")
    .refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
      message: "Invalid receiver ID format",
    }),
  senderAddress: z
    .string()
    .min(1, "Sender address is required")
    .max(500, "Sender address too long"),
  receiverAddress: z
    .string()
    .min(1, "Receiver address is required")
    .max(500, "Receiver address too long"),
  deliveryDate: z.string().datetime("Invalid date format").optional(),
  isFragile: z.boolean().optional(),
  notes: z.string().max(1000, "Notes too long").optional(),
});

export const updateParcelValidationSchema = z.object({
  type: z.nativeEnum(ParcelType).optional(),
  weight: z
    .number()
    .positive("Weight must be positive")
    .min(0.1, "Weight must be at least 0.1 kg")
    .optional(),
  price: z
    .number()
    .positive("Price must be positive")
    .min(0, "Price cannot be negative")
    .optional(),
  senderAddress: z
    .string()
    .min(1, "Sender address is required")
    .max(500, "Sender address too long")
    .optional(),
  receiverAddress: z
    .string()
    .min(1, "Receiver address is required")
    .max(500, "Receiver address too long")
    .optional(),
  deliveryDate: z.string().datetime("Invalid date format").optional(),
  status: z.nativeEnum(ParcelStatus).optional(),
});

export const updateParcelStatusValidationSchema = z.object({
  status: z.nativeEnum(ParcelStatus, {
    message: "Invalid status",
  }),
  note: z.string().max(500, "Note too long").optional(),
  location: z.string().max(100, "Location too long").optional(),
});

export const blockParcelValidationSchema = z.object({
  block: z.boolean(),
  reason: z.string().max(500, "Reason too long").optional(),
});

export const paymentValidationSchema = z.object({
  isPaid: z.boolean(),
  paymentMethod: z
    .string()
    .min(1, "Payment method is required")
    .max(50, "Payment method too long")
    .optional(),
});

export const ParcelValidation = {
  createParcelValidationSchema,
  updateParcelValidationSchema,
  updateParcelStatusValidationSchema,
  blockParcelValidationSchema,
  paymentValidationSchema,
};
