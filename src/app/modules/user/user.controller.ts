/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import httpStatus from "../../utils/httpStatus";
import { UserService } from "./user.service";
import { JwtPayload } from "jsonwebtoken";
import { UserFilter } from "./user.interface";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/createAsync";

// Create User
const createUser = async (req: Request, res: Response) => {
  try {
    const result = await UserService.createUser(req.body);
    res.status(httpStatus.CREATED).json({
      success: true,
      message: "User created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to create user",
    });
  }
};

const getSingleUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await UserService.getSingleUser(id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User retrieved Successfully",
      data: result.data,
    });
  }
);

const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const result = await UserService.getMe(decodedToken.userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Your profile Retrieved Successfully",
      data: result.data,
    });
  }
);

// Get All Receivers for create parcel from sender dashboard
const getAllReceivers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const filters: UserFilter = {
      role: req.query.role as any,
      status: req.query.status as any,
      search: req.query.search as string,
    };

    const result = await UserService.getAllReceivers(page, limit, filters);
    res.status(httpStatus.OK).json({
      success: true,
      message: "Receivers retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error: any) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to retrieve users",
    });
  }
};

// Get All Users
const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const filters: UserFilter = {
      role: req.query.role as any,
      status: req.query.status as any,
      search: req.query.search as string,
    };

    const result = await UserService.getAllUsers(page, limit, filters);
    res.status(httpStatus.OK).json({
      success: true,
      message: "Users retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error: any) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to retrieve users",
    });
  }
};

// Update User
const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await UserService.updateUser(
      id,
      req.body,
      req.user as JwtPayload
    );
    res.status(httpStatus.OK).json({
      success: true,
      message: "User updated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to update user",
    });
  }
};

// Block User
const blockUserController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { block } = req.body;

    const result = await UserService.blockUser(id, block);
    res.status(httpStatus.OK).json({
      success: true,
      message: `User ${block ? "blocked" : "unblocked"} successfully`,
      data: result,
    });
  } catch (error: any) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to update user status",
    });
  }
};

// Delete User
const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await UserService.deleteUser(id);
    res.status(httpStatus.OK).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to delete user",
    });
  }
};

export const UserController = {
  createUser,
  getMe,
  getAllReceivers,
  getSingleUser,
  getAllUsers,
  updateUser,
  blockUserController,
  deleteUser,
};
