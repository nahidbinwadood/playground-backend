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
const appError_1 = require("../../errorHelpers/appError");
// create user==>
// Unauthenticated self-service signup. The schema already pins role to 'user';
// pinning it again here keeps the boundary safe on its own terms, so loosening
// the schema later cannot silently reopen the admin-minting hole.
const createUser = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield auth_service_1.AuthServices.createUser(Object.assign(Object.assign({}, req.body), { role: 'user' }));
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
// refresh token ==>
// The refresh token lives in an httpOnly cookie, so the client cannot read it
// to send it back — the browser must attach the cookie itself.
const refreshToken = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
    if (!token) {
        throw new appError_1.AppError(http_status_codes_1.default.UNAUTHORIZED, 'No refresh token found in cookies');
    }
    const tokens = yield auth_service_1.AuthServices.refreshToken(token);
    // rotate both cookies so the next refresh works with the new refresh token
    (0, setCookie_1.setAuthCookie)(res, tokens);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'Access token refreshed successfully',
        data: tokens,
    });
}));
exports.AuthControllers = {
    createUser,
    loginUser,
    getProfile,
    changePassword,
    logOut,
    updateProfile,
    refreshToken,
};
