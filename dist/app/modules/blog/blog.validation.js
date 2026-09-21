"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBlogValidationSchema = exports.createBlogValidationSchema = void 0;
const zod_1 = require("zod");
const blog_interface_1 = require("./blog.interface");
// 24 hex chars — catches a malformed Mongo id before it reaches Mongoose, where
// it would surface as an opaque CastError
const categoryIdSchema = zod_1.z
    .string('Category is required')
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid category id');
exports.createBlogValidationSchema = zod_1.z.object({
    title: zod_1.z.string(),
    excerpt: zod_1.z.string().optional(),
    content: zod_1.z.string(),
    coverImage: zod_1.z.string().optional(),
    status: zod_1.z.enum(Object.values(blog_interface_1.BlogStatus)).optional(),
    category: categoryIdSchema,
    author: zod_1.z.string(),
});
exports.updateBlogValidationSchema = zod_1.z
    .object({
    title: zod_1.z.string().optional(),
    excerpt: zod_1.z.string().optional(),
    content: zod_1.z.string().optional(),
    coverImage: zod_1.z.string().optional(),
    status: zod_1.z
        .enum(Object.values(blog_interface_1.BlogStatus))
        .optional(),
    // omitted means "leave the category alone"
    category: categoryIdSchema.optional(),
    isPublished: zod_1.z.boolean().optional(),
    deleteImageUrl: zod_1.z.string().optional(),
})
    .superRefine((data, ctx) => {
    if (data.coverImage) {
        if (!data.deleteImageUrl) {
            ctx.addIssue({
                code: 'custom',
                path: ['deleteImageUrl'],
                message: 'Delete Image Url is required',
            });
        }
    }
});
