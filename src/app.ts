import express, { Request, Response } from "express";
import cors from "cors";
import expressSession from "express-session";
import { envVariables } from "./app/config/env";
import cookieParser from "cookie-parser";
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";
import passport from "passport";
import "./app/config/passport";

const app = express();

// session & passport
app.use(
  expressSession({
    secret: envVariables.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// middleware
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

// routes
app.use("/api/v1", router);

// test route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the Parcel Delivery System API 🚀",
  });
});

// error handler
app.use(globalErrorHandler);
app.use(notFound);

export default app;
