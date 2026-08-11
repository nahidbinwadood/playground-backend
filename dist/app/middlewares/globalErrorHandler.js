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
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const appError_1 = require("../errorHelpers/appError");
const zod_1 = require("zod");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const multer_1 = __importDefault(require("multer"));
const env_1 = require("../config/env");
const cloudinary_config_1 = require("../config/cloudinary.config");
const globalErrorHandler = (err, req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    let statusCode = http_status_codes_1.default.INTERNAL_SERVER_ERROR;
    let message = 'Something Went Wrong';
    let errors;
    // console.log('🔴 Error caught by global handler:', {
    //   name: err.name,
    //   message: err.message,
    //   type: err.constructor.name,
    //   stack: err.stack,
    // });
    // path only set once upload succeeded; a delete failure must not mask the original error
    if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) {
        try {
            yield (0, cloudinary_config_1.deleteImageFromCloudinary)(req.file.path);
        }
        catch (cleanupError) {
            console.log('Failed to clean up uploaded image:', cleanupError);
        }
    }
    // ========= CUSTOM APP ERROR=============
    if (err instanceof appError_1.AppError) {
        statusCode = err.statusCode;
        message = err.message;
        console.log('✓ Handled as AppError');
    }
    // ========= ZOD VALIDATION ERROR=============
    else if (err instanceof zod_1.ZodError) {
        statusCode = http_status_codes_1.default.BAD_REQUEST;
        message = 'Zod Validation Error';
        // format zod errors in a readable object
        errors = (_b = err === null || err === void 0 ? void 0 : err.issues) === null || _b === void 0 ? void 0 : _b.reduce((acc, error) => {
            const path = error === null || error === void 0 ? void 0 : error.path.join('.');
            acc[path] = error === null || error === void 0 ? void 0 : error.message;
            return acc;
        }, {});
        console.log('✓ Handled as Zod Validation Error');
    }
    // ========= JWT ERROR(Token Expiration)=============
    else if (err instanceof jsonwebtoken_1.default.TokenExpiredError) {
        statusCode = http_status_codes_1.default.UNAUTHORIZED;
        message = 'Session has expired. Please login again';
        errors = err;
    }
    // ========= JWT ERROR(Invalid Token)=============
    else if (err instanceof jsonwebtoken_1.default.JsonWebTokenError) {
        statusCode = http_status_codes_1.default.UNAUTHORIZED;
        message = 'Invalid token. Please login again.';
        errors = err;
        console.log('✓ Handled as Invalid Token Error');
    }
    // ========= MULTER UPLOAD ERROR=============
    else if (err instanceof multer_1.default.MulterError) {
        statusCode = http_status_codes_1.default.BAD_REQUEST;
        const multerMessages = {
            LIMIT_FILE_SIZE: 'File is too large. Max size is 5MB',
            LIMIT_UNEXPECTED_FILE: 'Unexpected file field. Use "file" as field name',
            LIMIT_FILE_COUNT: 'Too many files uploaded',
        };
        message = multerMessages[err.code] || err.message;
        console.log('✓ Handled as Multer Error');
    }
    // ========= CLOUDINARY UPLOAD ERROR=============
    else if (err === null || err === void 0 ? void 0 : err.http_code) {
        statusCode =
            err.http_code >= 400 && err.http_code < 500
                ? http_status_codes_1.default.BAD_REQUEST
                : http_status_codes_1.default.INTERNAL_SERVER_ERROR;
        message = `Image upload failed: ${err.message}`;
        console.log('✓ Handled as Cloudinary Error');
    }
    // ========= MONGODB ERRORS=============
    // duplicate key error
    else if (err.code === 11000) {
        statusCode = http_status_codes_1.default.CONFLICT;
        const field = Object.keys(err.keyValue)[0];
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        console.log('✓ Handled as MongoDB Duplicate Error');
    }
    // Validation Error
    else if (err.name === 'ValidationError') {
        statusCode = http_status_codes_1.default.BAD_REQUEST;
        message = 'Validation Error';
        errors = Object.keys(err === null || err === void 0 ? void 0 : err.errors).reduce((acc, key) => {
            acc[key] = err.errors[key].message;
            return acc;
        }, {});
    }
    // Cast Error(Invalid Object Id)
    else if (err.name === 'CastError') {
        statusCode = http_status_codes_1.default.BAD_REQUEST;
        message = 'Invalid Id Format';
        console.log('✓ Handled as Cast Error');
    }
    // ============ GENERIC ERRORS ============
    else if (err instanceof Error) {
        statusCode = http_status_codes_1.default.INTERNAL_SERVER_ERROR;
        message = err.message || 'Internal Server Error';
        console.log('✓ Handled as Generic Error');
    }
    // ============ UNKNOWN ERRORS ============
    else {
        statusCode = http_status_codes_1.default.INTERNAL_SERVER_ERROR;
        message = 'An unexpected error occurred';
        console.log('✓ Handled as Unknown Error');
    }
    // ============ SEND RESPONSE ============
    const errorResponse = {
        success: false,
        statusCode,
        message,
        errors,
        stack: env_1.envVars.NODE_ENV == 'development' ? err === null || err === void 0 ? void 0 : err.stack : null,
    };
    if (errors && Object.keys(errors).length > 0) {
        errorResponse.errors = errors;
    }
    (0, sendResponse_1.default)(res, errorResponse);
});
exports.default = globalErrorHandler;
