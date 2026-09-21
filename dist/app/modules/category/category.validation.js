"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategorySchema = exports.createCategorySchema = void 0;
const zod_1 = require("zod");
const category_interface_1 = require("./category.interface");
const toneEnum = Object.values(category_interface_1.CATEGORY_TONES);
// The slug is never client-supplied: it is generated from the name so it cannot
// drift from the label the owner actually typed.
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z
        .string('Name is required')
        .min(1, 'Name is required')
        .max(40, 'Name cannot exceed 40 characters'),
    description: zod_1.z
        .string()
        .max(160, 'Description cannot exceed 160 characters')
        .optional(),
    tone: zod_1.z
        .enum(toneEnum, `Tone must be ${Object.values(category_interface_1.CATEGORY_TONES).join(',')}`)
        .optional(),
});
// All fields optional — the admin form sends only what changed.
exports.updateCategorySchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, 'Name cannot be empty')
        .max(40, 'Name cannot exceed 40 characters')
        .optional(),
    description: zod_1.z
        .string()
        .max(160, 'Description cannot exceed 160 characters')
        .optional(),
    tone: zod_1.z
        .enum(toneEnum, `Tone must be ${Object.values(category_interface_1.CATEGORY_TONES).join(',')}`)
        .optional(),
});
