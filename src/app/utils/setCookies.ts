import { Response } from "express";

export interface AuthToken {
  accessToken?: string;
  refreshToken?: string;
}

export const setAuthCookie = (res: Response, tokenInfo: AuthToken) => {
  const isDev = process.env.NODE_ENV !== "production";

  if (tokenInfo.accessToken) {
    res.cookie("accessToken", tokenInfo.accessToken, {
      httpOnly: true,
      // sameSite: "none", // allow cross-site
      // secure: true, // HTTPS only
      sameSite: isDev ? "lax" : "none",
      secure: !isDev, // secure only in production
    });
  }

  if (tokenInfo.refreshToken) {
    res.cookie("refreshToken", tokenInfo.refreshToken, {
      httpOnly: true,
      // sameSite: "none",
      // secure: true,
      sameSite: isDev ? "lax" : "none",
      secure: !isDev,
    });
  }
};
