import { JwtPayload } from "jsonwebtoken";
import { envVariables } from "../config/env";
import { generateToken, verifyToken } from "./jwt";
import { User } from "../modules/user/user.model";
import AppError from "../errorHelper/AppError";
import httpStatus from "./httpStatus";
import { IUser, UserStatus } from "../modules/user/user.interface";

export const createUserTokens = (user: Partial<IUser>) => {
  const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };
  const accessToken = generateToken(
    jwtPayload,
    envVariables.JWT_ACCESS_SECRET,
    envVariables.JWT_ACCESS_EXPIRES
  );
  const refreshToken = generateToken(
    jwtPayload,
    envVariables.JWT_REFRESH_SECRET,
    envVariables.JWT_REFRESH_EXPIRES
  );
  return {
    accessToken,
    refreshToken,
  };
};

export const createNewAccessTokenWithRefreshToken = async (
  refreshToken: string
) => {
  const verifiedRefreshToken = verifyToken(
    refreshToken,
    envVariables.JWT_REFRESH_SECRET
  ) as JwtPayload;

  const isUserExist = await User.findOne({
    email: verifiedRefreshToken?.email,
  });

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exist...");
  }

  if (
    isUserExist.status === UserStatus.BLOCKED ||
    isUserExist.status === UserStatus.INACTIVE
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist}...`);
  }

  const jwtPayload = {
    userId: isUserExist._id,
    email: isUserExist.email,
    role: isUserExist.role,
  };
  const accessToken = generateToken(
    jwtPayload,
    envVariables.JWT_ACCESS_SECRET,
    envVariables.JWT_ACCESS_EXPIRES
  );

  return {
    accessToken,
  };
};
