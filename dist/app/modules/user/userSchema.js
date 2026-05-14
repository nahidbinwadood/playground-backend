"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.changePasswordSchema = exports.loginUserSchema = exports.createUserSchema = void 0;
const z = __importStar(require("zod"));
const user_interface_1 = require("./user.interface");
exports.createUserSchema = z.object({
    name: z
        .string('Name is required')
        .min(1, 'Name is required')
        .max(80, 'Name cannot exceed 80 characters'),
    email: z
        .email('Enter a valid email')
        .min(1, 'Email is required')
        .max(80, 'Email cannot exceed 80 characters'),
    role: z.enum(['admin', 'user'], 'Role must me admin or user'),
    password: z
        .string('Password is required')
        .min(8, 'Password must be at least 8 characters long')
        .max(50, 'Password cannot exceed 50 characters')
        .regex(/[A-Z]/, 'Password should contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password should container at least one lowercase letter')
        .regex(/[0-9]/, 'Password should container at least one number')
        .regex(/[!@#%$*^(),.?":P{}]/, 'Password should container at least one special character'),
});
exports.loginUserSchema = z.object({
    email: z
        .email('Enter a valid email')
        .min(1, 'Email is required')
        .max(80, 'Email cannot exceed 80 characters'),
    password: z
        .string('Password is required')
        .min(8, 'Password must be at least 8 characters long')
        .max(50, 'Password cannot exceed 50 characters'),
});
exports.changePasswordSchema = z.object({
    oldPassword: z
        .string('Old Password is required')
        .min(8, 'Old Password must be at least 8 characters long')
        .max(50, 'Old Password cannot exceed 50 characters'),
    newPassword: z
        .string('New Password is required')
        .min(8, 'New Password must be at least 8 characters long')
        .max(50, 'New Password cannot exceed 50 characters'),
});
exports.updateUserSchema = z.object({
    name: z
        .string('Name is required')
        .min(1, 'Name is required')
        .max(80, 'Name cannot exceed 80 characters')
        .optional(),
    role: z.enum(['admin', 'user'], 'Role must me admin or user').optional(),
    isActive: z
        .enum(Object.values(user_interface_1.IsActive), `isActive must be between ${Object.values(user_interface_1.IsActive)}`)
        .optional(),
    isDeleted: z.boolean().optional(),
});
