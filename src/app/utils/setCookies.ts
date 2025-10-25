import { Response } from "express";
// import { envVariables } from "../config/env";

export interface AuthToken {
  accessToken?: string;
  refreshToken?: string;
}

export const setAuthCookie = (res: Response, tokenInfo: AuthToken) => {
  // const isProd = envVariables.NODE_ENV === "production";

  if (tokenInfo.accessToken) {
    res.cookie("accessToken", tokenInfo.accessToken, {
      httpOnly: true,
      // secure: isProd,
      secure: true,
      // sameSite: "strict",
      sameSite: "none",
    });
  }
  if (tokenInfo.refreshToken) {
    res.cookie("refreshToken", tokenInfo.refreshToken, {
      httpOnly: true,
      // secure: isProd,
      secure: true,
      // sameSite: "strict",
      sameSite: "none",
    });
  }
};
