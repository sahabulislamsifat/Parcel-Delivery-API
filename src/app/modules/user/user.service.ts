import { JwtPayload } from "jsonwebtoken";
import { envVariables } from "../../config/env";
import AppError from "../../errorHelper/AppError";
import httpStatus from "../../utils/httpStatus";
import { IUser, Role, AuthProviderType, UserStatus } from "./user.interface";
import { User } from "./user.model";
import bcryptjs from "bcryptjs";

// Create User
const createUser = async (payload: Partial<IUser>): Promise<IUser> => {
  const { email, password, ...rest } = payload;

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

  const authProvider = {
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

// Update User
const updateUser = async (
  id: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
): Promise<IUser | null> => {
  const existingUser = await User.findById(id);
  if (!existingUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (payload.role && decodedToken.role !== Role.ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "Only ADMIN can change roles");
  }

  if (payload.status && decodedToken.role !== Role.ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "Only ADMIN can change status");
  }

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

// Block/Unblock User
const blockUser = async (id: string, block: boolean): Promise<IUser | null> => {
  const user = await User.findById(id);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  user.status = block ? UserStatus.BLOCKED : UserStatus.ACTIVE;
  await user.save();
  return user;
};

export const UserService = {
  createUser,
  getAllUsers,
  updateUser,
  blockUser,
};
