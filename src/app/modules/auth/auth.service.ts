import { JwtPayload } from "jsonwebtoken";
import { createNewAccessTokenWithRefreshToken } from "../../utils/userToken";
import { User } from "../user/user.model";
import AppError from "../../errorHelper/AppError";
import httpStatus from "../../utils/httpStatus";
import bcrypt from "bcryptjs";
import { envVariables } from "../../config/env";

// Custom decoded token type
interface DecodedUser extends JwtPayload {
  userId: string;
}

const getNewAccessToken = async (
  refreshToken: string
): Promise<{ accessToken: string }> => {
  try {
    const { accessToken } = await createNewAccessTokenWithRefreshToken(
      refreshToken
    );
    return { accessToken };
  } catch (err) {
    console.error("Refresh token error:", err);
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Invalid or expired refresh token"
    );
  }
};

const resetPassword = async (
  oldPassword: string,
  newPassword: string,
  decoded: DecodedUser
): Promise<void> => {
  const user = await User.findById(decoded.userId).select("+password");

  if (!user || !user.password) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "User not found or password missing"
    );
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Old password doesn't match");
  }

  user.password = await bcrypt.hash(
    newPassword,
    Number(envVariables.BCRYPT_SALT_ROUND)
  );

  await user.save();
};

export const authService = {
  getNewAccessToken,
  resetPassword,
};
