/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/createAsync";
import passport from "passport";
import AppError from "../../errorHelper/AppError";
import { createUserTokens } from "../../utils/userToken";
import { setAuthCookie } from "../../utils/setCookies";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "../../utils/httpStatus";
import { JwtPayload } from "jsonwebtoken";
import { envVariables } from "../../config/env";
import { authService } from "./auth.service";
import { IUser, Role } from "../user/user.interface";

// Custom decoded token type
interface DecodedUserToken extends JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "local",
      async (err: unknown, user: any, info: { message?: string }) => {
        if (err || !user) {
          return next(
            new AppError(
              httpStatus.UNAUTHORIZED,
              info?.message || "Login failed"
            )
          );
        }

        const tokens = await createUserTokens(user);
        const userInfo =
          typeof user.toObject === "function" ? user.toObject() : user;

        setAuthCookie(res, tokens);

        sendResponse(res, {
          success: true,
          statusCode: httpStatus.OK,
          message: "Login successful",
          data: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: userInfo,
          },
        });
      }
    )(req, res, next);
  }
);

const getNewAccessToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError(httpStatus.BAD_REQUEST, "Refresh token not found");
  }

  const { accessToken } = await authService.getNewAccessToken(refreshToken);

  setAuthCookie(res, {
    refreshToken,
    accessToken,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "New access token issued",
    data: { accessToken },
  });
});

const logout = catchAsync(async (_req: Request, res: Response) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: envVariables.NODE_ENV === "production",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: envVariables.NODE_ENV === "production",
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Logout successful",
    data: null,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const decodedToken = req.user as DecodedUserToken;

  await authService.resetPassword(oldPassword, newPassword, decodedToken);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Password updated successfully",
    data: null,
  });
});

const googleCallbackController = catchAsync(async (req, res) => {
  const redirect = (req.query.state as string) || "";
  const user = req.user as IUser;

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const tokens = await createUserTokens(user);
  setAuthCookie(res, tokens);

  res.redirect(`${envVariables.FRONTEND_URL}/${redirect}`);
});

export const authControllers = {
  credentialsLogin,
  getNewAccessToken,
  logout,
  resetPassword,
  googleCallbackController,
};
