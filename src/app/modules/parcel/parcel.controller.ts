/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextFunction, Request, Response } from "express";
import AppError from "../../errorHelper/AppError";
import httpStatus from "../../utils/httpStatus";
import { ParcelService } from "./parcel.service";
import { sendResponse } from "../../utils/sendResponse";
import mongoose from "mongoose";
import { ParcelStatus } from "./parcel.interface";

const getUserId = (req: Request): string => {
  if (!req.user?.userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User information not found");
  }
  return req.user.userId.toString();
};

const createParcel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const senderId = getUserId(req);
    const payload = { ...req.body, sender: senderId };

    const parcel = await ParcelService.createParcel(payload, senderId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Parcel created successfully",
      data: parcel,
    });
  } catch (error) {
    next(error);
  }
};

const getAllParcels = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await ParcelService.getAllParcels(req.query);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcels retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

const getParcelById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const parcel = await ParcelService.getParcelById(id);

    if (!parcel) {
      throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
    }

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel retrieved successfully",
      data: parcel,
    });
  } catch (error) {
    next(error);
  }
};

const getParcelsBySender = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const senderId = getUserId(req);
    const result = await ParcelService.getParcelsBySender(senderId, req.query);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Sender parcels retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

const getParcelsByReceiver = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const receiverId = getUserId(req);
    const result = await ParcelService.getParcelsByReceiver(
      receiverId,
      req.query
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Receiver parcels retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

const getParcelByTrackingId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { trackingId } = req.params;
    // console.log(trackingId);

    const parcel = await ParcelService.getParcelByTrackingId(trackingId);

    if (!parcel) {
      throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
    }

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel retrieved successfully",
      data: parcel,
    });
  } catch (error) {
    next(error);
  }
};

const updateParcelStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status, note, location } = req.body;
    const updatedBy = new mongoose.Types.ObjectId(getUserId(req));

    const parcel = await ParcelService.updateParcelStatus(
      id,
      status,
      updatedBy,
      note,
      location
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel status updated successfully",
      data: parcel,
    });
  } catch (error) {
    next(error);
  }
};

const assignDriver = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parcelId = req.params.id;
    const driverId = req.body.driverId;
    const adminId = getUserId(req);

    const parcel = await ParcelService.assignDriver(
      parcelId,
      driverId,
      adminId
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Driver assigned successfully",
      data: parcel,
    });
  } catch (error) {
    next(error);
  }
};

const cancelParcel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const senderId = getUserId(req);

    const parcel = await ParcelService.cancelParcel(id, senderId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel cancelled successfully",
      data: parcel,
    });
  } catch (error) {
    next(error);
  }
};

const confirmDelivery = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const receiverId = getUserId(req);

    const parcel = await ParcelService.confirmDelivery(id, receiverId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Delivery confirmed successfully",
      data: parcel,
    });
  } catch (error) {
    next(error);
  }
};

const getDeliveredParcels = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const receiverId = getUserId(req);
    const result = await ParcelService.getParcelsByReceiver(receiverId, {
      ...req.query,
      status: ParcelStatus.DELIVERED,
    });

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Delivered parcels retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

const getReceiverStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const receiverId = getUserId(req);
    const statistics = await ParcelService.getReceiverStatistics(receiverId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Receiver statistics retrieved successfully",
      data: statistics,
    });
  } catch (error) {
    next(error);
  }
};

const deleteParcel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const parcel = await ParcelService.deleteParcel(id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel deleted successfully",
      data: parcel,
    });
  } catch (error) {
    next(error);
  }
};

const blockUnblockParcel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { block, reason } = req.body;

    const parcel = await ParcelService.blockUnblockParcel(id, block, reason);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: `Parcel ${block ? "blocked" : "unblocked"} successfully`,
      data: parcel,
    });
  } catch (error) {
    next(error);
  }
};

const updatePaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { isPaid, paymentMethod } = req.body;

    const parcel = await ParcelService.updatePaymentStatus(
      id,
      isPaid,
      paymentMethod
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: `Payment status updated to ${isPaid ? "paid" : "pending"}`,
      data: parcel,
    });
  } catch (error) {
    next(error);
  }
};

const getStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const statistics = await ParcelService.getParcelStatistics();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcel statistics retrieved successfully",
      data: statistics,
    });
  } catch (error) {
    next(error);
  }
};

const searchParcels = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parcels = await ParcelService.searchParcels(req.query as any);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Parcels search completed successfully",
      data: parcels,
    });
  } catch (error) {
    next(error);
  }
};

export const ParcelController = {
  createParcel,
  getAllParcels,
  getDeliveredParcels,
  getReceiverStatistics,
  getParcelById,
  getParcelsBySender,
  getParcelsByReceiver,
  getParcelByTrackingId,
  updateParcelStatus,
  assignDriver,
  cancelParcel,
  confirmDelivery,
  deleteParcel,
  blockUnblockParcel,
  updatePaymentStatus,
  getStatistics,
  searchParcels,
};
