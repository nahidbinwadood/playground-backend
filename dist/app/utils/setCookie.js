"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeAuthCookie = exports.setAuthCookie = void 0;
const app_1 = require("../../app");
const setAuthCookie = (res, tokenInfo) => {
    // set access token==>
    if (tokenInfo === null || tokenInfo === void 0 ? void 0 : tokenInfo.accessToken) {
        res.cookie('accessToken', tokenInfo === null || tokenInfo === void 0 ? void 0 : tokenInfo.accessToken, {
            httpOnly: true,
            secure: app_1.envVars.NODE_ENV === 'production',
            sameSite: 'lax',
        });
    }
    // set refresh token==>
    if (tokenInfo === null || tokenInfo === void 0 ? void 0 : tokenInfo.refreshToken) {
        res.cookie('refreshToken', tokenInfo === null || tokenInfo === void 0 ? void 0 : tokenInfo.refreshToken, {
            httpOnly: true,
            secure: app_1.envVars.NODE_ENV === 'production',
            sameSite: 'lax',
        });
    }
};
exports.setAuthCookie = setAuthCookie;
const removeAuthCookie = (res, cookieNames) => {
    cookieNames.forEach((cookie) => res.clearCookie(cookie, {
        httpOnly: true,
        secure: app_1.envVars.NODE_ENV === 'production',
        sameSite: app_1.envVars.NODE_ENV === 'production' ? 'none' : 'lax',
    }));
};
exports.removeAuthCookie = removeAuthCookie;
