import { NextFunction, Request, Response } from "express";
import { ZodObject, ZodRawShape } from "zod";

export type AnyZodObject = ZodObject<ZodRawShape>;

export const validateRequest =
  (zodSchema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedData = await zodSchema.parseAsync(req.body);
      // TypeScript error fix: bypass readonly typing (optional workaround)
      req.body = parsedData;
      next();
    } catch (error) {
      next(error);
    }
  };
