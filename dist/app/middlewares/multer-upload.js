"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const appError_1 = require("../errorHelpers/appError");
const multerUpload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new appError_1.AppError(http_status_codes_1.default.BAD_REQUEST, 'Only image files are allowed'));
        }
    },
});
exports.default = multerUpload;
