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
exports.createNewAccessToken = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_interface_1 = require("../modules/user/user.interface");
const appError_1 = require("../errorHelpers/appError");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const user_model_1 = require("../modules/user/user.model");
const server_1 = __importDefault(require("../../server"));
const generateToken = (data) => {
    const payload = {
        userId: data === null || data === void 0 ? void 0 : data.id,
        email: data === null || data === void 0 ? void 0 : data.email,
        role: data === null || data === void 0 ? void 0 : data.role,
    };
    // generate access token==>
    const accessToken = jsonwebtoken_1.default.sign(payload, server_1.default.JWT_ACCESS_SECRET, {
        expiresIn: server_1.default.JWT_ACCESS_EXPIRES,
    });
    // generate refresh token==>
    const refreshToken = jsonwebtoken_1.default.sign(payload, server_1.default.JWT_REFRESH_SECRET, {
        expiresIn: server_1.default.JWT_REFRESH_EXPIRES,
    });
    return { accessToken, refreshToken };
};
exports.generateToken = generateToken;
const verifyToken = (token, secret) => {
    return jsonwebtoken_1.default.verify(token, secret);
};
exports.verifyToken = verifyToken;
const createNewAccessToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const isVerified = (0, exports.verifyToken)(refreshToken, server_1.default.JWT_REFRESH_SECRET);
    // throw error if the access token is invalid==>
    if (!isVerified) {
        throw new appError_1.AppError(http_status_codes_1.default.BAD_REQUEST, 'Invalid Access Token');
    }
    const isUserExist = yield user_model_1.User.findOne({ email: isVerified === null || isVerified === void 0 ? void 0 : isVerified.email });
    // throw error if the user doest not exist==>
    if (!isUserExist) {
        throw new appError_1.AppError(http_status_codes_1.default.UNAUTHORIZED, 'User doest not exist');
    }
    // throw error if the user is not active==>
    if ((isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.isActive) !== user_interface_1.IsActive.ACTIVE) {
        throw new appError_1.AppError(http_status_codes_1.default.BAD_GATEWAY, `User is ${isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.isActive}`);
    }
    // throw error if the user is deleted==>
    if (isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.isDeleted) {
        throw new appError_1.AppError(http_status_codes_1.default.BAD_GATEWAY, `User is ${isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.isDeleted}`);
    }
    const newAccessToken = (0, exports.generateToken)(isUserExist);
    return newAccessToken;
});
exports.createNewAccessToken = createNewAccessToken;
