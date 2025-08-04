import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: number | string;
  DB_URL: string;
  NODE_ENV: "development" | "production" | "test";
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRES: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES: string;
  BCRYPT_SALT_ROUND: string;
  SUPER_ADMIN_EMAIL: string;
  SUPER_ADMIN_PASSWORD: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CALLBACK_URL: string;
}

const loadEnvVariables = (): EnvConfig => {
  const requiredEnvVariables: string[] = [
    "PORT",
    "DB_URL",
    "NODE_ENV",
    "JWT_ACCESS_SECRET",
    "JWT_ACCESS_EXPIRES",
    "JWT_REFRESH_SECRET",
    "JWT_REFRESH_EXPIRES",
    "BCRYPT_SALT_ROUND",
    "SUPER_ADMIN_EMAIL",
    "SUPER_ADMIN_PASSWORD",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CALLBACK_URL",
  ];

  requiredEnvVariables.forEach((variable) => {
    if (!process.env[variable]) {
      throw new Error(`Environment variable ${variable} is not defined`);
    }
  });

  return {
    PORT: process.env.PORT as number | string,
    DB_URL: process.env.DB_URL as string,
    NODE_ENV: process.env.NODE_ENV as "development" | "production" | "test",
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
    JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
    JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES as string,
    BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string,
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL as string,
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD as string,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL as string,
  };
};

export const envVariables: EnvConfig = loadEnvVariables();
