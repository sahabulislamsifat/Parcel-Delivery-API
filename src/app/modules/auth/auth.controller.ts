/* eslint-disable @typescript-eslint/no-explicit-any */
import { JwtPayload } from "jsonwebtoken";
import { Role } from "../user/user.interface";
import { catchAsync } from "../../utils/createAsync";
import { NextFunction, Request, Response } from "express";
import passport from "passport";
import AppError from "../../errorHelper/AppError";
import httpStatus from "../../utils/httpStatus";
import { createUserTokens } from "../../utils/userToken";
import { setAuthCookie } from "../../utils/setCookies";
import { sendResponse } from "../../utils/sendResponse";
import { authService } from "./auth.service";
import { envVariables } from "../../config/env";

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

  setAuthCookie(res, { refreshToken, accessToken });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "New access token issued",
    data: { accessToken },
  });
});

const logout = catchAsync(async (_req: Request, res: Response) => {
  const isProd = envVariables.NODE_ENV === "production";
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
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
  const decodedToken = req.user as unknown as DecodedUserToken;

  await authService.resetPassword(oldPassword, newPassword, decodedToken);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Password updated successfully",
    data: null,
  });
});

const googleCallbackController = catchAsync(async (req, res) => {
  let redirectTo = req.query.state ? (req.query.state as string) : "";
  if (redirectTo.startsWith("/")) {
    redirectTo = redirectTo.slice(1);
  }

  // /booking => booking , => "/" => ""
  const user = req.user;
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  const tokenInfo = createUserTokens(user);

  setAuthCookie(res, tokenInfo);

  res.redirect(`${envVariables.FRONTEND_URL}/${redirectTo}`);
});

export const authControllers = {
  credentialsLogin,
  getNewAccessToken,
  logout,
  resetPassword,
  googleCallbackController,
};
