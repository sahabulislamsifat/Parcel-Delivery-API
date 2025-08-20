import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelper/AppError";
import httpStatus from "../utils/httpStatus";
import { Role } from "../modules/user/user.interface";

export const checkUserOwnershipOrAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Check if req.user exists
    if (!req.user) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User information not found");
    }

    // Allow admin to access any user
    if (req.user.role === Role.ADMIN) {
      return next();
    }

    const userID = req.user.userId || req.user.id || req.user._id;

    if (!userID) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User ID not found in token");
    }

    // Allow users to access their own data
    if (userID.toString() === id.toString()) {
      return next();
    }

    throw new AppError(
      httpStatus.FORBIDDEN,
      "Access denied: You can only access your own resources"
    );
  } catch (error) {
    next(error);
  }
};
