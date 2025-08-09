/* eslint-disable no-console */
import express from "express";
import { createServer } from "http";
import app from "./app";
import { envVariables } from "./app/config/env";
import mongoose from "mongoose";

const server = createServer(app);

app.use(express.json());

const startServer = async () => {
  console.log(envVariables.NODE_ENV);

  try {
    await mongoose.connect(envVariables.DB_URL);
    console.log("Connected to MongoDB");

    server.listen(envVariables.PORT, () => {
      console.log(`Server is running on http://localhost:${envVariables.PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

(async () => {
  await startServer();
})();

//* Unhandled Rejection
process.on("unhandledRejection", (err) => {
  console.log("unhandledRejection is detected. Shutting down...", err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

//* Uncaught Exception Handling
process.on("uncaughtException", (err) => {
  console.log("uncaughtException is detected. Shutting down...", err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

//* Signal termination sigterm
process.on("SIGTERM", () => {
  console.log("SIGTERM is received. Shutting down gracefully...");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
});

//* Signal termination sigint
process.on("SIGINT", () => {
  console.log("SIGINT is received. Shutting down gracefully...");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
});
