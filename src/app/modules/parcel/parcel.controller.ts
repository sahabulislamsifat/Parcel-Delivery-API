import { NextFunction, Request, Response } from "express";
import AppError from "../../errorHelper/AppError";
import { ParcelService } from "./parcel.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "../../utils/httpStatus";
import mongoose from "mongoose";

const getUserId = (req: Request): string => {
  if (!req.user?.userId)
    throw new AppError(401, "Unauthorized: User not found");
  return req.user.userId;
};

const createParcel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const senderId = getUserId(req);
    const payload = { ...req.body, sender: senderId };
    const parcel = await ParcelService.createParcel(payload);
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
    const parcels = await ParcelService.getAllParcels(req.query);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All parcels retrieved",
      data: parcels,
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
    const parcels = await ParcelService.getParcelsBySender(senderId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Sender parcels retrieved",
      data: parcels,
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
    const parcels = await ParcelService.getParcelsByReceiver(receiverId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Receiver parcels retrieved",
      data: parcels,
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
      message: "Parcel status updated",
      data: parcel,
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
      message: "Parcel deleted",
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
    const { block } = req.body;
    const parcel = await ParcelService.blockUnblockParcel(id, block);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: `Parcel ${block ? "blocked" : "unblocked"}`,
      data: parcel,
    });
  } catch (error) {
    next(error);
  }
};

export const ParcelController = {
  createParcel,
  getAllParcels,
  getParcelsBySender,
  getParcelsByReceiver,
  updateParcelStatus,
  deleteParcel,
  blockUnblockParcel,
};
