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
exports.AuthControllers = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const auth_service_1 = require("./auth.service");
const setCookie_1 = require("../../utils/setCookie");
// create user==>
const createUser = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield auth_service_1.AuthServices.createUser(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: 'User created successfully',
        data: response,
    });
}));
// login==>
const loginUser = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield auth_service_1.AuthServices.loginUser(req.body);
    // set the cookie
    (0, setCookie_1.setAuthCookie)(res, response === null || response === void 0 ? void 0 : response.tokens);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'Login Successful',
        data: response,
    });
}));
// get profile==>
const getProfile = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.user;
    const response = yield auth_service_1.AuthServices.getProfile(email);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'User data fetched successfully',
        data: response,
    });
}));
// update profile==>
const updateProfile = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const payload = req.body;
    const response = yield auth_service_1.AuthServices.updateProfile(userId, payload);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'Profile updated successfully',
        data: response,
    });
}));
// change password==>
const changePassword = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.user;
    const { oldPassword, newPassword } = req.body;
    const response = yield auth_service_1.AuthServices.changePassword({
        email,
        oldPassword,
        newPassword,
    });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'Password changed successfully',
        data: response,
    });
}));
// logOut==>
const logOut = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    (0, setCookie_1.removeAuthCookie)(res, ['accessToken', 'refreshToken']);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'User Logged Out Successfully',
    });
}));
exports.AuthControllers = {
    createUser,
    loginUser,
    getProfile,
    changePassword,
    logOut,
    updateProfile,
};
