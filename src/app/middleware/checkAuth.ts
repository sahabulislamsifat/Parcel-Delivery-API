import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelper/AppError";
import { envVariables } from "../config/env";
import { JwtPayload } from "jsonwebtoken";
import { verifyToken } from "../utils/jwt";

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      let token: string | undefined;

      // First check Authorization header
      if (req.headers.authorization) {
        const authHeader = req.headers.authorization;
        token = authHeader.startsWith("Bearer ")
          ? authHeader.slice(7).trim()
          : authHeader.trim();
      }

      // Fallback: check cookies
      if (!token && req.cookies?.accessToken) {
        token = req.cookies.accessToken;
      }

      if (!token) {
        throw new AppError(403, "No authentication token provided");
      }

      const verifiedToken = verifyToken(
        token,
        envVariables.JWT_ACCESS_SECRET
      ) as JwtPayload | null;

      if (!verifiedToken) {
        throw new AppError(403, "Invalid or expired token");
      }

      if (!verifiedToken.role) {
        throw new AppError(403, "Invalid token payload: missing role");
      }

      if (authRoles.length && !authRoles.includes(verifiedToken.role)) {
        throw new AppError(403, "You are not permitted to view this route");
      }

      req.user = verifiedToken;
      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error);
      next(error);
    }
  };
