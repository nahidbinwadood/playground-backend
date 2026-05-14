"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBlogValidationSchema = exports.createBlogValidationSchema = void 0;
const zod_1 = require("zod");
const blog_interface_1 = require("./blog.interface");
exports.createBlogValidationSchema = zod_1.z.object({
    title: zod_1.z.string(),
    excerpt: zod_1.z.string().optional(),
    content: zod_1.z.string(),
    coverImage: zod_1.z.string().optional(),
    status: zod_1.z.enum(Object.values(blog_interface_1.BlogStatus)).optional(),
    author: zod_1.z.string(),
});
exports.updateBlogValidationSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    excerpt: zod_1.z.string().optional(),
    content: zod_1.z.string().optional(),
    coverImage: zod_1.z.string().optional(),
    status: zod_1.z.enum(Object.values(blog_interface_1.BlogStatus)).optional(),
    isPublished: zod_1.z.boolean().optional(),
});
