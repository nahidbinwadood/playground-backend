"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const connectDB_1 = require("../db/connectDB");
const checkDBConnection = (req, res, next) => {
    if (!(0, connectDB_1.getDBStatus)()) {
        (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_codes_1.default.SERVICE_UNAVAILABLE,
            message: 'Database connection failed. Please try again later.',
        });
        return;
    }
    next();
};
exports.default = checkDBConnection;
