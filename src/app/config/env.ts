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
  // FRONTEND_URL_LOCAL: string | undefined; // optional — only used in local dev
  // FRONTEND_URL_PRODUCTION: string;
}

export const loadEnvironmentVariables = (): IEnvVariables => {
  // FRONTEND_URL_LOCAL is optional — it's only available in local dev environments
  const requiredVariables: Array<keyof IEnvVariables> = [
    'PORT',
    'DB_URL',
    'NODE_ENV',
    'BCRYPT_SALT_ROUND',
    'JWT_ACCESS_SECRET',
    'JWT_ACCESS_EXPIRES',
    'JWT_REFRESH_SECRET',
    'JWT_REFRESH_EXPIRES',
    // 'FRONTEND_URL_PRODUCTION',
  ];

  requiredVariables.forEach((key) => {
    // throw an error if any required environment variable is missing
    if (!process.env[key]) {
      throw new Error(`Environment Variable Missing: ${key}`);
    }
  });

  // Diagnostic log — confirms DB_URL is loaded at startup
  console.info(
    `🔗 DB_URL loaded: ${process.env.DB_URL ? 'YES ✅' : 'NO ❌ — DB_URL is missing!'}`
  );

  return {
    PORT: process.env.PORT as string,
    DB_URL: process.env.DB_URL as string,
    NODE_ENV: process.env.NODE_ENV as 'development' | 'production',
    BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
    JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
    JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES as string,
    // FRONTEND_URL_LOCAL: process.env.FRONTEND_URL_LOCAL, // may be undefined in production
    // FRONTEND_URL_PRODUCTION: process.env.FRONTEND_URL_PRODUCTION as string,
  };
};
