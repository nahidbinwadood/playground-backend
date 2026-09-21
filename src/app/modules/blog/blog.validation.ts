import { z } from 'zod';
import { BlogStatus } from './blog.interface';

// 24 hex chars — catches a malformed Mongo id before it reaches Mongoose, where
// it would surface as an opaque CastError
const categoryIdSchema = z
  .string('Category is required')
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid category id');

export const createBlogValidationSchema = z.object({
  title: z.string(),

  excerpt: z.string().optional(),

  content: z.string(),

  coverImage: z.string().optional(),

  status: z.enum(Object.values(BlogStatus) as [string, ...string[]]).optional(),
  category: categoryIdSchema,
  author: z.string(),
});

export const updateBlogValidationSchema = z
  .object({
    title: z.string().optional(),

    excerpt: z.string().optional(),

    content: z.string().optional(),

    coverImage: z.string().optional(),

    status: z
      .enum(Object.values(BlogStatus) as [string, ...string[]])
      .optional(),
    // omitted means "leave the category alone"
    category: categoryIdSchema.optional(),
    isPublished: z.boolean().optional(),
    deleteImageUrl: z.string().optional(),
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
