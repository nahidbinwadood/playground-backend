import { config } from 'dotenv';

config();

interface IEnvVariables {
  PORT: string;
  DB_URL: string;
  NODE_ENV: 'development' | 'production';
  BCRYPT_SALT_ROUND: string;
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRES: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES: string;
  FRONTEND_URL_LOCAL: string | undefined; // optional — only used in local dev
  FRONTEND_URL_PRODUCTION: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  REMINDER_SECRET: string;
  REMINDER_TZ: string;
}

const loadEnvironmentVariables = (): IEnvVariables => {
  // FRONTEND_URL_LOCAL is optional — it's only available in local dev environments
  // FRONTEND_URL_LOCAL is deliberately NOT required — it only exists in local
  // dev, and a prod boot must not fail over its absence
  const requiredVariables: Array<keyof IEnvVariables> = [
    'PORT',
    'DB_URL',
    'NODE_ENV',
    'BCRYPT_SALT_ROUND',
    'JWT_ACCESS_SECRET',
    'JWT_ACCESS_EXPIRES',
    'JWT_REFRESH_SECRET',
    'JWT_REFRESH_EXPIRES',
    'FRONTEND_URL_PRODUCTION',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    // reminder module — a missing value would mean the reminder silently
    // never runs, which is the failure mode this validation exists to catch
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_CHAT_ID',
    'REMINDER_SECRET',
    'REMINDER_TZ',
  ];

  requiredVariables.forEach((key) => {
    // throw an error if any required environment variable is missing
    if (!process.env[key]) {
      throw new Error(`Environment Variable Missing: ${key}`);
    }
  });

  return {
    PORT: process.env.PORT as string,
    DB_URL: process.env.DB_URL as string,
    NODE_ENV: process.env.NODE_ENV as 'development' | 'production',
    BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
    JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
    JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES as string,
    FRONTEND_URL_LOCAL: process.env.FRONTEND_URL_LOCAL,
    FRONTEND_URL_PRODUCTION: process.env.FRONTEND_URL_PRODUCTION as string,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN as string,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID as string,
    REMINDER_SECRET: process.env.REMINDER_SECRET as string,
    REMINDER_TZ: process.env.REMINDER_TZ as string,
  };
};

export const envVars = loadEnvironmentVariables();
