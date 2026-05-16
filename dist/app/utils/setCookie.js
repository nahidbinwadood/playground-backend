"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeAuthCookie = exports.setAuthCookie = void 0;
const server_1 = __importDefault(require("../../server"));
const setAuthCookie = (res, tokenInfo) => {
    // set access token==>
    if (tokenInfo === null || tokenInfo === void 0 ? void 0 : tokenInfo.accessToken) {
        res.cookie('accessToken', tokenInfo === null || tokenInfo === void 0 ? void 0 : tokenInfo.accessToken, {
            httpOnly: true,
            secure: server_1.default.NODE_ENV === 'production',
            sameSite: 'lax',
        });
    }
    // set refresh token==>
    if (tokenInfo === null || tokenInfo === void 0 ? void 0 : tokenInfo.refreshToken) {
        res.cookie('refreshToken', tokenInfo === null || tokenInfo === void 0 ? void 0 : tokenInfo.refreshToken, {
            httpOnly: true,
            secure: server_1.default.NODE_ENV === 'production',
            sameSite: 'lax',
        });
    }
};
exports.setAuthCookie = setAuthCookie;
const removeAuthCookie = (res, cookieNames) => {
    cookieNames.forEach((cookie) => res.clearCookie(cookie, {
        httpOnly: true,
        secure: server_1.default.NODE_ENV === 'production',
        sameSite: server_1.default.NODE_ENV === 'production' ? 'none' : 'lax',
    }));
};
exports.removeAuthCookie = removeAuthCookie;
