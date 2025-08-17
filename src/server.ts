/* eslint-disable no-console */
import { createServer } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVariables } from "./app/config/env";

const server = createServer(app);

const startServer = async () => {
  console.log("Environment:", envVariables.NODE_ENV);

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

//* graceful shutdown handlers
process.on("unhandledRejection", (err) => {
  console.error("unhandledRejection is detected. Shutting down...", err);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.error("uncaughtException is detected. Shutting down...", err);
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => process.exit(0));
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  server.close(() => process.exit(0));
});
