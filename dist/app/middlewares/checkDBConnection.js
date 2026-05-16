"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const connectDB_1 = require("../db/connectDB");
const app_1 = require("../../app");
const checkDBConnection = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // If already connected, proceed immediately
    if ((0, connectDB_1.getDBStatus)()) {
        return next();
    }
    // Connection dropped (e.g. Atlas idle timeout) — try to reconnect once
    try {
        console.warn('⚠️ DB not connected on request. Attempting reconnect...');
        yield (0, connectDB_1.connectDB)(app_1.envVars.DB_URL);
        return next();
    }
    catch (_a) {
        (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_codes_1.default.SERVICE_UNAVAILABLE,
            message: 'Database connection failed. Please try again later.',
        });
    }
});
exports.default = checkDBConnection;
