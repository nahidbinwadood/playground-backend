"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNoteSchema = exports.createNoteSchema = void 0;
const zod_1 = require("zod");
const blog_interface_1 = require("../blog/blog.interface");
const topicEnum = Object.values(blog_interface_1.BlogTypes);
// 24 hex chars — catches a malformed Mongo id before it reaches Mongoose,
// where it would surface as an opaque CastError
const blogIdSchema = zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid blog id');
// The quick-note form submits blog: null for a standalone entry. An empty
// string is accepted too (Radix Select cannot use null as an item value) and
// is normalized to null here.
exports.createNoteSchema = zod_1.z.object({
    blog: zod_1.z
        .union([blogIdSchema, zod_1.z.literal(''), zod_1.z.null()])
        .optional()
        .transform((value) => (value === '' ? null : value)),
    title: zod_1.z
        .string('Title is required')
        .min(1, 'Title is required')
        .max(120, 'Title cannot exceed 120 characters'),
    description: zod_1.z
        .string()
        .max(200, 'Description cannot exceed 200 characters')
        .optional(),
    content: zod_1.z.string('Content is required').min(1, 'Content is required'),
    type: zod_1.z.enum(topicEnum, `Type must be ${Object.values(blog_interface_1.BlogTypes).join(',')}`),
    // not sent by the quick-note form; notes are private from day one. Kept
    // here so a future publishing UI doesn't need a schema change.
    isPublished: zod_1.z.boolean().optional(),
});
// All fields optional — updateNoteAction only sends what changed. An empty
// string for blog means "drop it", null means "detach explicitly".
exports.updateNoteSchema = zod_1.z.object({
    blog: zod_1.z
        .union([blogIdSchema, zod_1.z.literal(''), zod_1.z.null()])
        .optional()
        .transform((value) => (value === '' ? undefined : value)),
    title: zod_1.z
        .string()
        .min(1, 'Title cannot be empty')
        .max(120, 'Title cannot exceed 120 characters')
        .optional(),
    description: zod_1.z
        .string()
        .max(200, 'Description cannot exceed 200 characters')
        .optional(),
    content: zod_1.z.string().min(1, 'Content cannot be empty').optional(),
    type: zod_1.z
        .enum(topicEnum, `Type must be ${Object.values(blog_interface_1.BlogTypes).join(',')}`)
        .optional(),
    isPublished: zod_1.z.boolean().optional(),
});
