"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const notFound = (req, res, next) => {
    (0, sendResponse_1.default)(res, {
        success: false,
        statusCode: http_status_codes_1.default.NOT_FOUND,
        message: 'Route not found',
    });
};
exports.default = notFound;
