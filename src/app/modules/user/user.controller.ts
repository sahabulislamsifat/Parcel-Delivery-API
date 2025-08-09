import { Request, Response } from "express";
import { catchAsync } from "../../utils/createAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "../../utils/httpStatus";
import { UserService } from "./user.service";
import { JwtPayload } from "jsonwebtoken";

// Create User
const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createUser(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User created successfully!",
    data: result,
  });
});

// Get All Users (with pagination)
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const result = await UserService.getAllUsers(page, limit);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully!",
    data: result.data,
    meta: result.meta,
  });
});

// Update User
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const decodedToken = req.user as JwtPayload;
  const result = await UserService.updateUser(id, req.body, decodedToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully!",
    data: result,
  });
});

export const UserController = {
  createUser,
  getAllUsers,
  updateUser,
};
