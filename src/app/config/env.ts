import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: number | string;
  DB_URL: string;
  NODE_ENV: "development" | "production" | "test";
}

const loadEnvVariables = (): EnvConfig => {
  const requiredEnvVariables: string[] = ["PORT", "DB_URL", "NODE_ENV"];

  requiredEnvVariables.forEach((variable) => {
    if (!process.env[variable]) {
      throw new Error(`Environment variable ${variable} is not defined`);
    }
  });

  return {
    PORT: process.env.PORT as number | string,
    DB_URL: process.env.DB_URL as string,
    NODE_ENV: process.env.NODE_ENV as "development" | "production" | "test",
  };
};

export const envVariables: EnvConfig = loadEnvVariables();
