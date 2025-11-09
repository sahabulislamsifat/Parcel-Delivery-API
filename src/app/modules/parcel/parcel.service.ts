/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";
import { IParcel, ParcelFilter, ParcelStatus } from "./parcel.interface";
import { User } from "../user/user.model";
import AppError from "../../errorHelper/AppError";
import httpStatus from "../../utils/httpStatus";
import { DeliveryChargeService } from "../deliveryCharge/deliveryCharge.service";
import { Parcel } from "./parcel.model";
import { QueryBuilder } from "../../utils/QueryBuilder";

// Generate unique trackingId
const generateTrackingId = (): string => {
  const random = Math.floor(100000 + Math.random() * 900000);
  const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
  return `TRK-${date}-${random}`;
};

const VALID_STATUS_TRANSITIONS: Record<ParcelStatus, ParcelStatus[]> = {
  REQUESTED: [ParcelStatus.APPROVED, ParcelStatus.CANCELLED],
  APPROVED: [ParcelStatus.DISPATCHED, ParcelStatus.CANCELLED],
  DISPATCHED: [ParcelStatus.IN_TRANSIT, ParcelStatus.CANCELLED],
  IN_TRANSIT: [ParcelStatus.OUT_FOR_DELIVERY, ParcelStatus.RETURNED],
  OUT_FOR_DELIVERY: [ParcelStatus.DELIVERED, ParcelStatus.RETURNED],
  DELIVERED: [],
  CANCELLED: [],
  RETURNED: [],
  BLOCKED: [ParcelStatus.APPROVED, ParcelStatus.CANCELLED],
};

// Calculate total amount
const calculateTotalAmount = (
  price: number,
  deliveryCharge: number
): number => {
  return price + deliveryCharge;
};

// Parcel Create
const createParcel = async (
  payload: Partial<IParcel>,
  userId: string
): Promise<IParcel> => {
  const senderId = new Types.ObjectId(userId);

  if (payload.receiver?.toString() === userId.toString()) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Sender and receiver cannot be the same user"
    );
  }

  // Check if receiver exists
  const receiver = await User.findById(payload.receiver);
  if (!receiver) {
    throw new AppError(httpStatus.BAD_REQUEST, "Receiver not found");
  }

  // Calculate delivery charge
  let deliveryCharge = 0;
  try {
    deliveryCharge = await DeliveryChargeService.calculateFee(
      payload.receiverAddress as string,
      payload.type as string,
      payload.weight as number
    );
  } catch (err) {
    console.error(err);
    deliveryCharge = 50; // fallback
  }

  const totalAmount = calculateTotalAmount(payload.price || 0, deliveryCharge);

  const parcelData: Partial<IParcel> = {
    trackingId: generateTrackingId(),
    status: ParcelStatus.REQUESTED,
    sender: senderId,
    deliveryCharge,
    totalAmount,
    statusLogs: [
      {
        status: ParcelStatus.REQUESTED,
        updatedBy: senderId,
        timestamp: new Date(),
        note: "Parcel created by sender",
      },
    ],
    ...payload,
  };

  let parcel: IParcel | undefined;

  for (let i = 0; i < 3; i++) {
    try {
      parcel = await Parcel.create(parcelData);
      break;
    } catch (err: any) {
      if (err.code === 11000 && err.keyPattern?.trackingId) {
        parcelData.trackingId = generateTrackingId();
      } else {
        throw err;
      }
    }
  }

  if (!parcel) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to create parcel"
    );
  }

  return parcel;
};

// -------Get Parcels
const getAllParcels = async (
  query: Record<string, unknown>
): Promise<{
  data: IParcel[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const parcelQuery = new QueryBuilder(
    Parcel.find().populate("sender receiver", "name email phone"),
    query
  )
    .search(["trackingId", "type", "status"])
    .filter()
    .sort()
    .paginate();

  const [data, total] = await Promise.all([
    parcelQuery.exec(),
    Parcel.countDocuments((parcelQuery as any)._filter || {}),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// -----SENDER
const getParcelsBySender = async (
  senderId: string,
  query: Record<string, unknown>
): Promise<{
  data: IParcel[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const baseQuery = { sender: new Types.ObjectId(senderId) };
  const parcelQuery = new QueryBuilder(
    Parcel.find(baseQuery).populate("receiver", "name email phone"),
    query
  )
    .search(["trackingId", "status"])
    .filter()
    .sort()
    .paginate();

  const [data, total] = await Promise.all([
    parcelQuery.exec(),
    Parcel.countDocuments(baseQuery),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

//------RECEIVER
const getParcelsByReceiver = async (
  receiverId: string,
  query: Record<string, unknown>
): Promise<{
  data: IParcel[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const baseQuery = { receiver: new Types.ObjectId(receiverId) };
  const parcelQuery = new QueryBuilder(
    Parcel.find(baseQuery).populate("sender", "name email phone"),
    query
  )
    .search(["trackingId", "status"])
    .filter()
    .sort()
    .paginate();
  const [data, total] = await Promise.all([
    parcelQuery.exec(),
    Parcel.countDocuments({
      ...baseQuery,
      ...(parcelQuery as any).getFilter(),
    }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// 🔄 GENERIC PARCEL STATUS UPDATE
const updateParcelStatus = async (
  parcelId: string,
  status: ParcelStatus,
  updatedBy: Types.ObjectId,
  note?: string,
  location?: string
): Promise<IParcel | null> => {
  const parcel = await Parcel.findById(parcelId);
  if (!parcel) throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");

  // prevent same-status update error
  if (parcel.status === status) {
    return parcel.populate("sender receiver", "name email phone");
  }

  const allowedNextStatuses = VALID_STATUS_TRANSITIONS[parcel.status];
  if (!allowedNextStatuses.includes(status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Invalid status transition: ${parcel.status} → ${status}`
    );
  }

  parcel.status = status;
  parcel.statusLogs.push({
    status,
    updatedBy,
    timestamp: new Date(),
    note: note || `Status updated to ${status}`,
    location,
  });

  if (status === ParcelStatus.DELIVERED) {
    parcel.actualDeliveryDate = new Date();
  }

  await parcel.save();
  return parcel.populate("sender receiver", "name email phone");
};

// ADMIN UPDATE STATUS (REUSES GENERIC LOGIC)
const adminUpdateStatus = async (
  parcelId: string,
  status: ParcelStatus,
  adminId: string,
  note?: string
): Promise<IParcel | null> => {
  // Admin calls the generic update function
  return updateParcelStatus(
    parcelId,
    status,
    new Types.ObjectId(adminId),
    note
  );
};

// CANCEL
const cancelParcel = async (
  parcelId: string,
  senderId: string
): Promise<IParcel | null> => {
  // const parcel = await Parcel.findById(parcelId);
  const parcel = await Parcel.findOne({ _id: parcelId, sender: senderId });
  if (!parcel) throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");

  // Check ownership
  if (!parcel.sender || parcel.sender.toString() !== senderId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only cancel your own parcels"
    );
  }

  // Check if parcel can be cancelled
  const nonCancellableStatuses = [
    ParcelStatus.DISPATCHED,
    ParcelStatus.IN_TRANSIT,
    ParcelStatus.OUT_FOR_DELIVERY,
    ParcelStatus.DELIVERED,
  ];

  if (nonCancellableStatuses.includes(parcel.status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot cancel parcel in ${parcel.status} status`
    );
  }
  parcel.status = ParcelStatus.CANCELLED;
  parcel.statusLogs.push({
    status: ParcelStatus.CANCELLED,
    updatedBy: new Types.ObjectId(senderId),
    timestamp: new Date(),
  });
  await parcel.save();
  return parcel;
};

//------CONFIRM DELIVERY
const confirmDelivery = async (
  parcelId: string,
  receiverId: string,
  action: "DELIVERED" | "RETURNED" = "DELIVERED"
): Promise<IParcel | null> => {
  const parcel = await Parcel.findById(parcelId);
  if (!parcel) throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");

  // Verify receiver
  if (!parcel.receiver || parcel.receiver.toString() !== receiverId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not the receiver of this parcel"
    );
  }

  if (
    ![ParcelStatus.OUT_FOR_DELIVERY, ParcelStatus.IN_TRANSIT].includes(
      parcel.status
    )
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Parcel is not ready for delivery confirmation"
    );
  }

  // parcel.status = ParcelStatus.DELIVERED;
  if (action === "DELIVERED") {
    parcel.status = ParcelStatus.DELIVERED;
    parcel.actualDeliveryDate = new Date();
  } else if (action === "RETURNED") {
    parcel.status = ParcelStatus.RETURNED;
  } else {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid action type");
  }

  parcel.statusLogs.push({
    status: ParcelStatus.DELIVERED,
    updatedBy: new Types.ObjectId(receiverId),
    timestamp: new Date(),
  });
  await parcel.save();
  return parcel;
};

const getReceiverStatistics = async (
  receiverId: string
): Promise<{
  total: number;
  delivered: number;
  pending: number;
  cancelled: number;
  revenue: number;
  recentParcels: IParcel[];
}> => {
  const baseFilter = { receiver: new Types.ObjectId(receiverId) };

  const [total, delivered, pending, cancelled, revenue, recentParcels] =
    await Promise.all([
      Parcel.countDocuments(baseFilter),
      Parcel.countDocuments({ ...baseFilter, status: ParcelStatus.DELIVERED }),
      Parcel.countDocuments({
        ...baseFilter,
        status: {
          $in: [
            ParcelStatus.REQUESTED,
            ParcelStatus.APPROVED,
            ParcelStatus.DISPATCHED,
            ParcelStatus.IN_TRANSIT,
            ParcelStatus.OUT_FOR_DELIVERY,
          ],
        },
      }),
      Parcel.countDocuments({ ...baseFilter, status: ParcelStatus.CANCELLED }),
      Parcel.aggregate([
        {
          $match: {
            receiver: new Types.ObjectId(receiverId),
            status: ParcelStatus.DELIVERED,
            isPaid: true,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
          },
        },
      ]),
      Parcel.find(baseFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("sender", "name email phone")
        .populate("receiver", "name email phone"),
    ]);

  return {
    total,
    delivered,
    pending,
    cancelled,
    revenue: revenue[0]?.total || 0,
    recentParcels,
  };
};

const getParcelByTrackingId = async (
  trackingId: string
): Promise<IParcel | null> => {
  return Parcel.findOne({
    trackingId: { $regex: `^${trackingId}$`, $options: "i" },
  })
    .populate("sender", "name email phone address")
    .populate("receiver", "name email phone address")
    .populate("assignedDriver", "name email phone");
};

const getParcelById = async (id: string): Promise<IParcel | null> => {
  return Parcel.findById(id)
    .populate("sender", "name email phone address")
    .populate("receiver", "name email phone address")
    .populate("assignedDriver", "name email phone");
};

// const updateParcelStatus = async (
//   parcelId: string,
//   status: ParcelStatus,
//   updatedBy: Types.ObjectId,
//   note?: string,
//   location?: string
// ): Promise<IParcel | null> => {
//   const parcel = await Parcel.findById(parcelId);
//   if (!parcel) throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");

//   const currentStatus = parcel.status;
//   const allowedNextStatuses = VALID_STATUS_TRANSITIONS[currentStatus];

//   if (!allowedNextStatuses.includes(status)) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       `Invalid status transition: ${currentStatus} → ${status}`
//     );
//   }

//   const statusUpdate = {
//     status,
//     updatedBy,
//     timestamp: new Date(),
//     note,
//     location,
//   };

//   const updateData: any = {
//     status,
//     $push: { statusLogs: statusUpdate },
//   };

//   // Set delivery date when delivered
//   if (status === ParcelStatus.DELIVERED) {
//     updateData.actualDeliveryDate = new Date();
//   }

//   return Parcel.findByIdAndUpdate(parcelId, updateData, {
//     new: true,
//     runValidators: true,
//   }).populate("sender receiver", "name email phone");
// };

const deleteParcel = async (parcelId: string): Promise<IParcel | null> => {
  const parcel = await Parcel.findById(parcelId);
  if (!parcel) throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");

  // Prevent deletion of parcels that are already in transit or delivered
  const protectedStatuses = [
    ParcelStatus.DISPATCHED,
    ParcelStatus.IN_TRANSIT,
    ParcelStatus.OUT_FOR_DELIVERY,
    ParcelStatus.DELIVERED,
  ];

  if (protectedStatuses.includes(parcel.status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot delete parcel in ${parcel.status} status`
    );
  }

  return Parcel.findByIdAndDelete(parcelId);
};

const blockUnblockParcel = async (
  parcelId: string,
  block: boolean,
  reason?: string
): Promise<IParcel | null> => {
  const parcel = await Parcel.findById(parcelId);
  if (!parcel) throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");

  const updateData: any = {
    isBlocked: block,
    $push: {
      statusLogs: {
        status: block ? ParcelStatus.BLOCKED : ParcelStatus.APPROVED,
        updatedBy: new Types.ObjectId(), // System or admin ID
        timestamp: new Date(),
        note: reason || `Parcel ${block ? "blocked" : "unblocked"} by admin`,
      },
    },
  };

  if (block) {
    updateData.status = ParcelStatus.BLOCKED;
  } else {
    // Unblock and return to previous approved status
    updateData.status = ParcelStatus.APPROVED;
  }

  return Parcel.findByIdAndUpdate(parcelId, updateData, {
    new: true,
    runValidators: true,
  }).populate("sender receiver", "name email phone");
};

const updatePaymentStatus = async (
  parcelId: string,
  isPaid: boolean,
  paymentMethod?: string
): Promise<IParcel | null> => {
  return Parcel.findByIdAndUpdate(
    parcelId,
    {
      isPaid,
      paymentMethod,
      $push: {
        statusLogs: {
          status: ParcelStatus.APPROVED, // Or keep current status
          updatedBy: new Types.ObjectId(), // System or admin ID
          timestamp: new Date(),
          note: `Payment ${isPaid ? "completed" : "pending"}${
            paymentMethod ? ` via ${paymentMethod}` : ""
          }`,
        },
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate("sender receiver", "name email phone");
};

const getParcelStatistics = async (): Promise<{
  total: number;
  delivered: number;
  inTransit: number;
  cancelled: number;
  revenue: number;
  pending: number;
}> => {
  const [total, delivered, inTransit, cancelled, pending, revenue] =
    await Promise.all([
      Parcel.countDocuments(),
      Parcel.countDocuments({ status: ParcelStatus.DELIVERED }),
      Parcel.countDocuments({
        status: {
          $in: [
            ParcelStatus.IN_TRANSIT,
            ParcelStatus.OUT_FOR_DELIVERY,
            ParcelStatus.DISPATCHED,
          ],
        },
      }),
      Parcel.countDocuments({ status: ParcelStatus.CANCELLED }),
      Parcel.countDocuments({ status: ParcelStatus.REQUESTED }),
      Parcel.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
          },
        },
      ]),
    ]);

  return {
    total,
    delivered,
    inTransit,
    cancelled,
    pending,
    revenue: revenue[0]?.total || 0,
  };
};

const searchParcels = async (filters: ParcelFilter): Promise<IParcel[]> => {
  const query: any = {};

  if (filters.trackingId) {
    query.trackingId = { $regex: filters.trackingId, $options: "i" };
  }
  if (filters.status) query.status = filters.status;
  if (filters.type) query.type = filters.type;
  if (filters.sender) query.sender = new Types.ObjectId(filters.sender);
  if (filters.receiver) query.receiver = new Types.ObjectId(filters.receiver);

  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {};
    if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
  }

  return Parcel.find(query)
    .populate("sender", "name email phone")
    .populate("receiver", "name email phone")
    .sort({ createdAt: -1 })
    .limit(50); // Limit search results
};

// ---------------------- ASSIGN DRIVER ----------------------
const assignDriver = async (
  parcelId: string,
  driverId: string,
  adminId: string
) => {
  const parcel = await Parcel.findById(parcelId);
  if (!parcel) throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");

  parcel.assignedDriver = new Types.ObjectId(driverId);
  parcel.statusLogs.push({
    status: parcel.status,
    updatedBy: new Types.ObjectId(adminId),
    timestamp: new Date(),
  });

  await parcel.save();
  return parcel.populate("sender receiver assignedDriver", "name email phone");
};

export const ParcelService = {
  createParcel,
  getAllParcels,
  getParcelsBySender,
  getParcelsByReceiver,
  getReceiverStatistics,
  getParcelById,
  updateParcelStatus,
  adminUpdateStatus,
  getParcelByTrackingId,
  cancelParcel,
  confirmDelivery,
  deleteParcel,
  blockUnblockParcel,
  updatePaymentStatus,
  getParcelStatistics,
  searchParcels,
  assignDriver,
};
