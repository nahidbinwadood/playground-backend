import { config } from 'dotenv';

config();

interface IEnvVariables {
  PORT: string;
  DB_URL: string;
  NODE_ENV: 'development' | 'production';
  BCRYPT_SALT_ROUND: string;
  JWT_SECRET: string;
  JWT_ACCESS_EXPIRES: string;
}

const loadEnvironmentVariables = (): IEnvVariables => {
  const requiredVariables: Array<keyof IEnvVariables> = [
    'PORT',
    'DB_URL',
    'NODE_ENV',
    'BCRYPT_SALT_ROUND',
    'JWT_SECRET',
    'JWT_ACCESS_EXPIRES',
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
    JWT_SECRET: process.env.BCRYPT_SALT_ROUND as string,
    JWT_ACCESS_EXPIRES: process.env.BCRYPT_SALT_ROUND as string,
  };
};

const envVars = loadEnvironmentVariables();

export default envVars;
