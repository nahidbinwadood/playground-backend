import { z } from 'zod';
import { BlogStatus } from './blog.interface';

export const createBlogValidationSchema = z.object({
  title: z.string(),

  excerpt: z.string().optional(),

  content: z.string(),

  coverImage: z.string().optional(),

  status: z.enum(Object.values(BlogStatus) as [string, ...string[]]).optional(),
  author: z.string(),
});

export const updateBlogValidationSchema = z.object({
  title: z.string().optional(),

  excerpt: z.string().optional(),

  content: z.string().optional(),

  coverImage: z.string().optional(),

  status: z.enum(Object.values(BlogStatus) as [string, ...string[]]).optional(),
  isPublished: z.boolean().optional(),
});
