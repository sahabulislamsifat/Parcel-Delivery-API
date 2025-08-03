import express, { Request, Response } from "express";

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.status(200).json("Welcome to the Parcel Delivery System API");
});

export default app;
