"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envVars = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const loadEnvironmentVariables = () => {
    // FRONTEND_URL_LOCAL is optional — it's only available in local dev environments
    const requiredVariables = [
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
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET',
    ];
    requiredVariables.forEach((key) => {
        // throw an error if any required environment variable is missing
        if (!process.env[key]) {
            throw new Error(`Environment Variable Missing: ${key}`);
        }
    });
    return {
        PORT: process.env.PORT,
        DB_URL: process.env.DB_URL,
        NODE_ENV: process.env.NODE_ENV,
        BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND,
        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
        JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
        JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES,
        FRONTEND_URL_LOCAL: process.env.FRONTEND_URL_LOCAL,
        FRONTEND_URL_PRODUCTION: process.env.FRONTEND_URL_PRODUCTION,
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    };
};
exports.envVars = loadEnvironmentVariables();
