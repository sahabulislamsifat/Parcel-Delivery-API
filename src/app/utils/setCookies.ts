import { Response } from "express";
import { envVariables } from "../config/env";

export interface AuthToken {
  accessToken?: string;
  refreshToken?: string;
}

export const setAuthCookie = (res: Response, tokenInfo: AuthToken) => {
  const isProd = envVariables.NODE_ENV === "production";

  if (tokenInfo.accessToken) {
    res.cookie("accessToken", tokenInfo.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
    });
  }
  if (tokenInfo.refreshToken) {
    res.cookie("refreshToken", tokenInfo.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
    });
  }
};
