import { z } from 'zod';
import { NOTE_STATUSES } from './note.interface';

// 24 hex chars — catches a malformed Mongo id before it reaches Mongoose,
// where it would surface as an opaque CastError
const blogIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid blog id');
const categoryIdSchema = z
  .string('Category is required')
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid category id');

// The quick-note form submits blog: null for a standalone entry. An empty
// string is accepted too (Radix Select cannot use null as an item value) and
// is normalized to null here.
export const createNoteSchema = z.object({
  blog: z
    .union([blogIdSchema, z.literal(''), z.null()])
    .optional()
    .transform((value) => (value === '' ? null : value)),

  title: z
    .string('Title is required')
    .min(1, 'Title is required')
    .max(120, 'Title cannot exceed 120 characters'),

  description: z
    .string()
    .max(200, 'Description cannot exceed 200 characters')
    .optional(),

  content: z.string('Content is required').min(1, 'Content is required'),

  // the note's own topic — a reference, not a copy of the blog's
  category: categoryIdSchema,

  // Optional: the quick-note form never sends it, and the model defaults a new
  // note to DRAFT, so omitting it is always safe.
  status: z.enum(NOTE_STATUSES).optional(),

  // not sent by the quick-note form; notes are private from day one. Kept
  // here so a future publishing UI doesn't need a schema change.
  isPublished: z.boolean().optional(),
});

// All fields optional — updateNoteAction only sends what changed. An empty
// string for blog means "drop it", null means "detach explicitly".
export const updateNoteSchema = z.object({
  blog: z
    .union([blogIdSchema, z.literal(''), z.null()])
    .optional()
    .transform((value) => (value === '' ? undefined : value)),

  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(120, 'Title cannot exceed 120 characters')
    .optional(),

  description: z
    .string()
    .max(200, 'Description cannot exceed 200 characters')
    .optional(),

  content: z.string().min(1, 'Content cannot be empty').optional(),

  // omitted means "leave the topic alone"
  category: categoryIdSchema.optional(),

  // omitted means "leave the status alone" — this is what the card's
  // Mark complete / Mark draft action sends, a single-key PATCH
  status: z.enum(NOTE_STATUSES).optional(),

  isPublished: z.boolean().optional(),
});
