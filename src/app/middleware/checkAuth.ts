import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelper/AppError";
import { envVariables } from "../config/env";
import { JwtPayload } from "jsonwebtoken";
import { verifyToken } from "../utils/jwt";

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let authorizationHeader = req.headers.authorization;

      if (!authorizationHeader) {
        throw new AppError(403, "No token received");
      }

      if (authorizationHeader.startsWith("Bearer ")) {
        authorizationHeader = authorizationHeader.split(" ")[1];
      }

      const token = authorizationHeader.trim();

      if (!token) {
        throw new AppError(403, "Invalid token format");
      }

      const verifiedToken = verifyToken(
        token,
        envVariables.JWT_ACCESS_SECRET
      ) as JwtPayload | null;

      if (!verifiedToken) {
        throw new AppError(403, "Invalid or expired token");
      }

      // Role check
      if (authRoles.length && !authRoles.includes(verifiedToken.role)) {
        throw new AppError(403, "You are not permitted to view this route!!!");
      }

      req.user = verifiedToken;
      next();
    } catch (error) {
      console.error("Error From JWT:", error);
      next(error);
    }
  };
