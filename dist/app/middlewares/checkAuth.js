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
const jwt_1 = require("../utils/jwt");
const env_1 = __importDefault(require("../config/env"));
const appError_1 = require("../errorHelpers/appError");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const user_model_1 = require("../modules/user/user.model");
const user_interface_1 = require("../modules/user/user.interface");
const checkAuth = (...authRoles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
            // throw error if no authentication token found==>
            if (!token) {
                throw new appError_1.AppError(http_status_codes_1.default.UNAUTHORIZED, 'No authorization token found');
            }
            const decodedToken = (0, jwt_1.verifyToken)(token, env_1.default.JWT_ACCESS_SECRET);
            const isUserExist = yield user_model_1.User.findOne({ email: decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.email });
            //throw error if the user doest not exist==>
            if (!isUserExist) {
                throw new appError_1.AppError(http_status_codes_1.default.BAD_REQUEST, 'User doest not exist');
            }
            // throw error if the user is not active==>
            if ((isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.isActive) !== user_interface_1.IsActive.ACTIVE) {
                throw new appError_1.AppError(http_status_codes_1.default.BAD_REQUEST, `User is ${isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.isActive}`);
            }
            //throw error if the user is deleted==>
            if (isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.isDeleted) {
                throw new appError_1.AppError(http_status_codes_1.default.BAD_REQUEST, `User is Deleted`);
            }
            // throw error  if the user doesn't have permission ==>
            if (!!authRoles.length && !authRoles.includes(isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.role)) {
                throw new appError_1.AppError(http_status_codes_1.default.UNAUTHORIZED, `You dont have permission to access this feature`);
            }
            req.user = decodedToken;
            next();
        }
        catch (error) {
            next(error);
        }
    });
};
exports.default = checkAuth;
