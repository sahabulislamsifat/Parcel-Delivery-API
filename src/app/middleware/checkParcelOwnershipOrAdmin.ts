import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelper/AppError";
import httpStatus from "../utils/httpStatus";
import { Role } from "../modules/user/user.interface";
import { Parcel } from "../modules/parcel/parcel.model";

export const checkParcelOwnershipOrAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parcelId = req.params.id;

    // Check if req.user exists
    if (!req.user) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User information not found");
    }

    // Allow admin to access any parcel
    if (req.user.role === Role.ADMIN) {
      return next();
    }

    const userID = req.user.userId || req.user.id || req.user._id;

    if (!userID) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User ID not found in token");
    }

    // Find the parcel
    const parcel = await Parcel.findById(parcelId);

    if (!parcel) {
      throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
    }

    // Check if user is the sender or receiver of the parcel
    const isSender =
      parcel.sender && parcel.sender.toString() === userID.toString();
    const isReceiver =
      parcel.receiver && parcel.receiver.toString() === userID.toString();

    if (isSender || isReceiver) {
      return next();
    }

    throw new AppError(
      httpStatus.FORBIDDEN,
      "Access denied: You can only access your own parcels"
    );
  } catch (error) {
    next(error);
  }
};

// Special middleware for sender-only operations (like cancel)
export const checkParcelSenderOrAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parcelId = req.params.id;

    if (!req.user) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User information not found");
    }

    // Allow admin to perform any action
    if (req.user.role === Role.ADMIN) {
      return next();
    }

    const userID = req.user.userId || req.user.id || req.user._id;

    if (!userID) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User ID not found in token");
    }

    const parcel = await Parcel.findById(parcelId);

    if (!parcel) {
      throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
    }

    // Check if user is the sender of the parcel
    const isSender =
      parcel.sender && parcel.sender.toString() === userID.toString();

    if (isSender) {
      return next();
    }

    throw new AppError(
      httpStatus.FORBIDDEN,
      "Access denied: Only the sender can perform this action"
    );
  } catch (error) {
    next(error);
  }
};

// Special middleware for receiver-only operations (like confirm delivery)
export const checkParcelReceiverOrAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parcelId = req.params.id;

    if (!req.user) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User information not found");
    }

    // Allow admin to perform any action
    if (req.user.role === Role.ADMIN) {
      return next();
    }

    const userID = req.user.userId || req.user.id || req.user._id;

    if (!userID) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User ID not found in token");
    }

    const parcel = await Parcel.findById(parcelId);

    if (!parcel) {
      throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
    }

    // Check if user is the receiver of the parcel
    const isReceiver =
      parcel.receiver && parcel.receiver.toString() === userID.toString();

    if (isReceiver) {
      return next();
    }

    throw new AppError(
      httpStatus.FORBIDDEN,
      "Access denied: Only the receiver can perform this action"
    );
  } catch (error) {
    next(error);
  }
};

// Middleware for status update permissions
export const checkParcelStatusUpdatePermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parcelId = req.params.id;
    const { status } = req.body;

    if (!req.user) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User information not found");
    }

    const userID = req.user.userId || req.user.id || req.user._id;

    if (!userID) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User ID not found in token");
    }

    const parcel = await Parcel.findById(parcelId);

    if (!parcel) {
      throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
    }

    // Admin can update any status
    if (req.user.role === Role.ADMIN) {
      return next();
    }

    // Sender can only cancel parcels (in certain statuses)
    const isSender =
      parcel.sender && parcel.sender.toString() === userID.toString();
    if (isSender && status === "CANCELLED") {
      const canCancel = ["REQUESTED", "APPROVED"].includes(parcel.status);
      if (canCancel) {
        return next();
      }
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Cannot cancel parcel in current status"
      );
    }

    // Receiver can only confirm delivery
    const isReceiver =
      parcel.receiver && parcel.receiver.toString() === userID.toString();
    if (isReceiver && status === "DELIVERED") {
      if (parcel.status === "OUT_FOR_DELIVERY") {
        return next();
      }
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Parcel is not out for delivery"
      );
    }

    throw new AppError(
      httpStatus.FORBIDDEN,
      "Access denied: You don't have permission to update this parcel's status"
    );
  } catch (error) {
    next(error);
  }
};
