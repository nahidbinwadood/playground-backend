"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const userSchema_1 = require("../user/userSchema");
const checkAuth_1 = __importDefault(require("../../middlewares/checkAuth"));
const router = (0, express_1.Router)();
// routes==>
// register==>
router.post('/create', (0, validateRequest_1.default)(userSchema_1.createUserSchema), auth_controller_1.AuthControllers.createUser);
// login==>
router.post('/login', (0, validateRequest_1.default)(userSchema_1.loginUserSchema), auth_controller_1.AuthControllers.loginUser);
// logout==>
router.post('/logout', (0, checkAuth_1.default)(), auth_controller_1.AuthControllers.logOut);
// get personal info==>
router.get('/me', (0, checkAuth_1.default)(), auth_controller_1.AuthControllers.getProfile);
// update profile==>
router.patch('/me', (0, checkAuth_1.default)(), (0, validateRequest_1.default)(userSchema_1.updateUserSchema), auth_controller_1.AuthControllers.updateProfile);
// change password==>
router.post('/change-password', (0, validateRequest_1.default)(userSchema_1.changePasswordSchema), (0, checkAuth_1.default)(), auth_controller_1.AuthControllers.changePassword);
exports.authRoutes = router;
