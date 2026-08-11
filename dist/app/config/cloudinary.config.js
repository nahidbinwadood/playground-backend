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
exports.deleteImageFromCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const env_1 = require("./env");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const appError_1 = require("../errorHelpers/appError");
const getPublicId = (url) => { var _a; return (_a = url.match(/\/v\d+\/(.+?)(?:\.[^/.]+)?$/)) === null || _a === void 0 ? void 0 : _a[1]; };
cloudinary_1.v2.config({
    cloud_name: env_1.envVars.CLOUDINARY_CLOUD_NAME,
    api_key: env_1.envVars.CLOUDINARY_API_KEY,
    api_secret: env_1.envVars.CLOUDINARY_API_SECRET,
});
const deleteImageFromCloudinary = (imageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const public_id = getPublicId(imageUrl);
    if (!public_id) {
        throw new appError_1.AppError(http_status_codes_1.default.BAD_REQUEST, 'Invalid cloudinary url, could not extract public id');
    }
    try {
        const result = yield cloudinary_1.v2.uploader.destroy(public_id);
        if (result.result !== 'ok') {
            throw new Error(`Cloudinary destroy failed: ${result.result}`);
        }
        console.log(`Deleted Image ${public_id}`);
    }
    catch (error) {
        throw new appError_1.AppError(http_status_codes_1.default.INTERNAL_SERVER_ERROR, error.message || 'Failed to delete cloudinary image');
    }
});
exports.deleteImageFromCloudinary = deleteImageFromCloudinary;
exports.default = cloudinary_1.v2;
