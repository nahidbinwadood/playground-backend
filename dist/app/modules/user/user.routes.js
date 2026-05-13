"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = __importDefault(require("../../middlewares/checkAuth"));
const user_controller_1 = require("./user.controller");
const router = (0, express_1.Router)();
// get all users==>
router.get('/get-all', (0, checkAuth_1.default)('admin'), user_controller_1.UserController.getAllUsers);
exports.userRoutes = router;
