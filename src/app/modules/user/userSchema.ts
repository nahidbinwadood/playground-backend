import * as z from 'zod';
import { IsActive } from './user.interface';

export const createUserSchema = z.object({
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
    .regex(
      /[!@#%$*^(),.?":P{}]/,
      'Password should container at least one special character'
    ),
});

export const loginUserSchema = z.object({
  email: z
    .email('Enter a valid email')
    .min(1, 'Email is required')
    .max(80, 'Email cannot exceed 80 characters'),
  password: z
    .string('Password is required')
    .min(8, 'Password must be at least 8 characters long')
    .max(50, 'Password cannot exceed 50 characters'),
});

export const changePasswordSchema = z.object({
  oldPassword: z
    .string('Old Password is required')
    .min(8, 'Old Password must be at least 8 characters long')
    .max(50, 'Old Password cannot exceed 50 characters'),
  newPassword: z
    .string('New Password is required')
    .min(8, 'New Password must be at least 8 characters long')
    .max(50, 'New Password cannot exceed 50 characters'),
});

export const updateUserSchema = z.object({
  name: z
    .string('Name is required')
    .min(1, 'Name is required')
    .max(80, 'Name cannot exceed 80 characters')
    .optional(),
  role: z.enum(['admin', 'user'], 'Role must me admin or user').optional(),
  isActive: z
    .enum(
      Object.values(IsActive),
      `isActive must be between ${Object.values(IsActive)}`
    )
    .optional(),
  isDeleted: z.boolean().optional(),
});
