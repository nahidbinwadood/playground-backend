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
const appError_1 = require("../errorHelpers/appError");
const cloudinary_config_1 = require("../config/cloudinary.config");
const validateRequest = (zodSchema, fileName) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (req.file && fileName) {
                // keep url on req.file.path so globalErrorHandler can clean up on later errors
                req.file.path = yield (0, cloudinary_config_1.uploadImageToCloudinary)(req.file.buffer);
                req.body = Object.assign(Object.assign({}, req.body), { [fileName]: req.file.path });
            }
            // check the empty body==>
            if (!req.body || Object.keys(req.body).length === 0) {
                throw new appError_1.AppError(http_status_codes_1.default.BAD_REQUEST, 'Request body is empty');
            }
            // parse the schema==>
            req.body = yield zodSchema.parseAsync(req.body);
            next();
        }
        catch (error) {
            next(error);
        }
    });
};
exports.default = validateRequest;
