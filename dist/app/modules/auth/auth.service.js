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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServices = void 0;
const appError_1 = require("../../errorHelpers/appError");
const user_model_1 = require("../user/user.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = __importDefault(require("../../config/env"));
const jwt_1 = require("../../utils/jwt");
// create user==>
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield user_model_1.User.findOne({ email: payload.email });
    // throw error if the user exists==>
    if (isExist) {
        throw new appError_1.AppError(http_status_codes_1.default.BAD_REQUEST, 'User already exist with this email');
    }
    // hash the password
    payload.password = yield bcryptjs_1.default.hash(payload.password, Number(env_1.default.BCRYPT_SALT_ROUND));
    // create user==>
    const user = yield user_model_1.User.create(Object.assign({}, payload));
    const _a = user === null || user === void 0 ? void 0 : user.toObject(), { password } = _a, rest = __rest(_a, ["password"]);
    return rest;
});
// login user==>
const loginUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield user_model_1.User.findOne({ email: payload.email });
    // throw error is the email doest match==>
    if (!isExist) {
        throw new appError_1.AppError(http_status_codes_1.default.NOT_FOUND, 'No user found with this email');
    }
    const passwordMatch = yield bcryptjs_1.default.compare(payload.password, isExist === null || isExist === void 0 ? void 0 : isExist.password);
    // throw error if the password is not matched==>
    if (!passwordMatch) {
        throw new appError_1.AppError(http_status_codes_1.default.BAD_REQUEST, 'The email or password doesn’t seem right. Please double-check and try again 🔁');
    }
    const _a = isExist.toObject(), { password } = _a, rest = __rest(_a, ["password"]);
    const userTokens = (0, jwt_1.generateToken)(isExist);
    return Object.assign(Object.assign({}, rest), { tokens: {
            accessToken: userTokens === null || userTokens === void 0 ? void 0 : userTokens.accessToken,
            refreshToken: userTokens === null || userTokens === void 0 ? void 0 : userTokens.refreshToken,
        } });
});
// get profile==>
const getProfile = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield user_model_1.User.findOne({ email });
    // throw the error if the user not found==>
    if (!isExist) {
        throw new appError_1.AppError(http_status_codes_1.default.NOT_FOUND, 'User not found');
    }
    const _a = isExist.toObject(), { password } = _a, rest = __rest(_a, ["password"]);
    return Object.assign({}, rest);
});
// update profile==>
const updateProfile = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield user_model_1.User.findByIdAndUpdate(userId, payload, {
        returnDocument: 'after',
    });
    if (response) {
        const _a = response.toObject(), { password } = _a, updatedResponse = __rest(_a, ["password"]);
        return updatedResponse;
    }
});
// change password==>
const changePassword = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield user_model_1.User.findOne({ email: payload.email });
    // throw the error if the user not found==>
    if (!isExist) {
        throw new appError_1.AppError(http_status_codes_1.default.NOT_FOUND, 'User not found');
    }
    const userData = isExist === null || isExist === void 0 ? void 0 : isExist.toObject();
    const isPasswordMatched = yield bcryptjs_1.default.compare(payload.oldPassword, userData.password);
    // throw error if the old password doest not match==>
    if (!isPasswordMatched) {
        throw new appError_1.AppError(http_status_codes_1.default.BAD_REQUEST, 'Your old password is incorrect');
    }
    const isNewPasswordIsSameAsOldPassword = yield bcryptjs_1.default.compare(payload.newPassword, userData === null || userData === void 0 ? void 0 : userData.password);
    //throw error if new password and old password is same==>
    if (isNewPasswordIsSameAsOldPassword) {
        throw new appError_1.AppError(http_status_codes_1.default.BAD_REQUEST, 'New Password cannot be same as the old password');
    }
    // hash the password==>
    const updatedPassword = yield bcryptjs_1.default.hash(payload.newPassword, Number(env_1.default.BCRYPT_SALT_ROUND));
    // update the password==>
    const response = yield user_model_1.User.findOneAndUpdate({ email: payload.email }, { password: updatedPassword }, { returnDocument: 'after' });
    if (response) {
        const _a = response === null || response === void 0 ? void 0 : response.toObject(), { password } = _a, updatedResponse = __rest(_a, ["password"]);
        return updatedResponse;
    }
});
exports.AuthServices = {
    createUser,
    loginUser,
    getProfile,
    changePassword,
    updateProfile,
};
