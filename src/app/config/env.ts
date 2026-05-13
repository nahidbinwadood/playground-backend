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
  FRONTEND_URL_LOCAL: string;
  FRONTEND_URL_PRODUCTION: string;
}

const loadEnvironmentVariables = (): IEnvVariables => {
  const requiredVariables: Array<keyof IEnvVariables> = [
    'PORT',
    'DB_URL',
    'NODE_ENV',
    'BCRYPT_SALT_ROUND',
    'JWT_ACCESS_SECRET',
    'JWT_ACCESS_EXPIRES',
    'JWT_REFRESH_SECRET',
    'JWT_REFRESH_EXPIRES',
    'FRONTEND_URL_LOCAL',
    'FRONTEND_URL_PRODUCTION',
  ];

  requiredVariables.forEach((key) => {
    // throw a error if any of the environment key is missing==>
    if (!process.env[key]) {
      throw new Error(`Environment Vairable Missing ${key}`);
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
    FRONTEND_URL_LOCAL: process.env.FRONTEND_URL_LOCAL as string,
    FRONTEND_URL_PRODUCTION: process.env.FRONTEND_URL_PRODUCTION as string,
  };
};

const envVars = loadEnvironmentVariables();

export default envVars;
