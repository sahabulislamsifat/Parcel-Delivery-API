/* eslint-disable @typescript-eslint/no-explicit-any */
import { JwtPayload } from "jsonwebtoken";
import { envVariables } from "../../config/env";
import AppError from "../../errorHelper/AppError";
import httpStatus from "../../utils/httpStatus";
import {
  IUser,
  Role,
  AuthProviderType,
  UserStatus,
  UserFilter,
  UserResponse,
} from "./user.interface";
import { User } from "./user.model";
import bcryptjs from "bcryptjs";

// Create User
const createUser = async (payload: Partial<IUser>): Promise<UserResponse> => {
  const {
    email,
    picture,
    phone,
    password,
    role = Role.SENDER,
    ...rest
  } = payload;

  const emailLower = email?.toLowerCase();
  const isUserExist = await User.findOne({ email: emailLower });

  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already exists!");
  }

  let hashedPassword: string | undefined;

  if (!payload.authProviders?.length && !password) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Password is required for credential-based registration"
    );
  }

  if (password) {
    hashedPassword = await bcryptjs.hash(
      password,
      Number(envVariables.BCRYPT_SALT_ROUND)
    );
  }

  const authProvider = {
    provider: AuthProviderType.CREDENTIALS,
    providerId: email as string,
    email,
  };

  const user = await User.create({
    email,
    password: hashedPassword,
    role,
    phone,
    picture,
    authProviders: [authProvider],
    ...rest,
  });

  const userObj = user.toObject();
  return { ...userObj, id: userObj._id.toString() } as UserResponse;
};

const getSingleUser = async (id: string) => {
  const user = await User.findById(id).select("-password");

  return {
    data: user,
  };
};

const getMe = async (id: string) => {
  const result = await User.findById(id).select("-password");

  return {
    data: result,
  };
};

// Get All receivers for create parcel in sender dashboard
const getAllReceivers = async (
  page = 1,
  limit = 10,
  filters: UserFilter = {}
) => {
  const skip = (page - 1) * limit;

  // Build filter query
  const query: any = {};
  if (filters.role) query.role = filters.role;
  if (filters.status) query.status = filters.status;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
      { phone: { $regex: filters.search, $options: "i" } },
    ];
  }

  const receivers = await User.find(query)
    .select("-password")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const totalUsers = await User.countDocuments(query);

  return {
    data: receivers,
    meta: {
      total: totalUsers,
      page,
      limit,
      totalPages: Math.ceil(totalUsers / limit),
    },
  };
};

// Get All Users with pagination and filtering
const getAllUsers = async (page = 1, limit = 10, filters: UserFilter = {}) => {
  const skip = (page - 1) * limit;

  // Build filter query
  const query: any = {};
  if (filters.role) query.role = filters.role;
  if (filters.status) query.status = filters.status;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
      { phone: { $regex: filters.search, $options: "i" } },
    ];
  }

  const users = await User.find(query)
    .select("-password")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const totalUsers = await User.countDocuments(query);

  return {
    data: users,
    meta: {
      total: totalUsers,
      page,
      limit,
      totalPages: Math.ceil(totalUsers / limit),
    },
  };
};

// Update User with ownership validation
const updateUser = async (
  id: string,
  payload: Partial<IUser>,
  requestingUser: JwtPayload
): Promise<UserResponse | null> => {
  const existingUser = await User.findById(id);
  if (!existingUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const requestingUserId = requestingUser.id || requestingUser.userId;

  // Check ownership or admin privileges
  if (requestingUserId !== id && requestingUser.role !== Role.ADMIN) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only update your own profile"
    );
  }

  if (
    requestingUser.role === Role.ADMIN &&
    requestingUserId === id &&
    payload.role &&
    payload.role !== Role.ADMIN
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Admin cannot demote their own role"
    );
  }

  // Only admin can change roles and status
  if (payload.role && requestingUser.role !== Role.ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "Only admin can change roles");
  }

  if (payload.status && requestingUser.role !== Role.ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "Only admin can change status");
  }

  // Hash password if provided
  if (payload.password) {
    payload.password = await bcryptjs.hash(
      payload.password,
      Number(envVariables.BCRYPT_SALT_ROUND)
    );
  }

  const updatedUser = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!updatedUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const updatedUserObj = updatedUser.toObject();
  return {
    ...updatedUserObj,
    id: updatedUserObj._id.toString(),
  } as UserResponse;
};

// Block/Unblock User (Admin only)
const blockUser = async (
  id: string,
  block: boolean
): Promise<UserResponse | null> => {
  const user = await User.findById(id);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  user.status = block ? UserStatus.BLOCKED : UserStatus.ACTIVE;
  await user.save();

  const userObj = user.toObject();
  return { ...userObj, id: userObj._id.toString() } as UserResponse;
};

// Delete User (Admin only)
const deleteUser = async (id: string): Promise<void> => {
  const user = await User.findById(id);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  user.status = UserStatus.INACTIVE;
  await user.save();
};

export const UserService = {
  createUser,
  getMe,
  getSingleUser,
  getAllReceivers,
  getAllUsers,
  updateUser,
  blockUser,
  deleteUser,
};
