import { JwtPayload } from "jsonwebtoken";
import { envVariables } from "../../config/env";
import AppError from "../../errorHelper/AppError";
import httpStatus from "../../utils/httpStatus";
import { IAuthProvider, IUser, Role, AuthProviderType } from "./user.interface";
import { User } from "./user.model";
import bcryptjs from "bcryptjs";

// Create User
const createUser = async (payload: Partial<IUser>): Promise<IUser> => {
  const { email, password, ...rest } = payload;

  // Check if email already exists
  const isUserExist = await User.findOne({ email });
  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already exists!");
  }

  let hashedPassword: string | undefined;
  if (password) {
    hashedPassword = await bcryptjs.hash(
      password,
      Number(envVariables.BCRYPT_SALT_ROUND)
    );
  }

  // Auth provider setup
  const authProvider: IAuthProvider = {
    provider: AuthProviderType.CREDENTIALS,
    providerId: email as string,
    email,
  };

  const user = await User.create({
    email,
    password: hashedPassword,
    authProviders: [authProvider],
    ...rest,
  });

  return user;
};

// Get All Users with pagination
const getAllUsers = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const users = await User.find().skip(skip).limit(limit);
  const totalUsers = await User.countDocuments();

  return {
    data: users,
    meta: { total: totalUsers, page, limit },
  };
};

// Update User with role-based restrictions
const updateUser = async (
  id: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
): Promise<IUser | null> => {
  const existingUser = await User.findById(id);
  if (!existingUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Role change restrictions
  if (payload.role && decodedToken.role !== Role.ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "Only ADMIN can change roles");
  }

  // Status change restrictions
  if (payload.status && decodedToken.role !== Role.ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "Only ADMIN can change status");
  }

  // Password hashing if updated
  if (payload.password) {
    payload.password = await bcryptjs.hash(
      payload.password,
      Number(envVariables.BCRYPT_SALT_ROUND)
    );
  }

  const updatedUser = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return updatedUser;
};

export const UserService = {
  createUser,
  getAllUsers,
  updateUser,
};
