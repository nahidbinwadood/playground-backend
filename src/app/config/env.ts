import dotenv from 'dotenv';

dotenv.config();

interface IEnvVariables {
  PORT: string;
  DB_URL: string;
  NODE_ENV: 'development' | 'production';
}

const loadEnvironmentVariables = (): IEnvVariables => {
  const requiredVariables: Array<keyof IEnvVariables> = [
    'PORT',
    'DB_URL',
    'NODE_ENV',
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
  };
};

const envVars = loadEnvironmentVariables();

export default envVars;
