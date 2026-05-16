"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./app/config/env");
const connectDB_1 = require("./app/db/connectDB");
const app_1 = __importDefault(require("./app"));
const envVars = (0, env_1.loadEnvironmentVariables)();
// Connect to DB once at module load — Vercel reuses warm instances,
// so subsequent invocations reuse the existing connection.
(0, connectDB_1.connectDB)(envVars.DB_URL).catch((err) => {
    console.error('❌ Initial DB connection failed:', err.message);
});
// Vercel requires the default export to be the Express app (a function).
// Do NOT call app.listen() — Vercel manages the HTTP server.
exports.default = app_1.default;
