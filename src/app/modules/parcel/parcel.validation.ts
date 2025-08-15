import z from "zod";
import { ParcelStatus } from "./parcel.interface";

const createParcelValidationSchema = z.object({
  type: z.string().min(1, "Parcel type is required"),
  weight: z.number().positive("Weight must be positive"),
  price: z.number().positive("Price must be positive"),
  fee: z.number().positive().optional(),
  senderAddress: z.string().min(1, "Sender address is required"),
  receiverAddress: z.string().min(1, "Receiver address is required"),
  receiver: z.string().min(1, "Receiver ID is required"),
  deliveryDate: z.string().datetime().optional(),
  status: z.nativeEnum(ParcelStatus).optional(),
});

const updateParcelValidationSchema = z.object({
  body: z.object({
    type: z.string().optional(),
    weight: z.number().positive().optional(),
    price: z.number().positive().optional(),
    fee: z.number().positive().optional(),
    senderAddress: z.string().optional(),
    receiverAddress: z.string().optional(),
    deliveryDate: z.string().datetime().optional(),
    status: z.nativeEnum(ParcelStatus).optional(),
  }),
});

export const ParcelValidation = {
  createParcelValidationSchema,
  updateParcelValidationSchema,
};
