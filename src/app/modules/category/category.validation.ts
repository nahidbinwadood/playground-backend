import { z } from 'zod';
import { CATEGORY_TONES } from './category.interface';

const toneEnum = Object.values(CATEGORY_TONES) as [string, ...string[]];

// The slug is never client-supplied: it is generated from the name so it cannot
// drift from the label the owner actually typed.
export const createCategorySchema = z.object({
  name: z
    .string('Name is required')
    .min(1, 'Name is required')
    .max(40, 'Name cannot exceed 40 characters'),

  description: z
    .string()
    .max(160, 'Description cannot exceed 160 characters')
    .optional(),

  tone: z
    .enum(toneEnum, `Tone must be ${Object.values(CATEGORY_TONES).join(',')}`)
    .optional(),
});

// All fields optional — the admin form sends only what changed.
export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Name cannot be empty')
    .max(40, 'Name cannot exceed 40 characters')
    .optional(),

  description: z
    .string()
    .max(160, 'Description cannot exceed 160 characters')
    .optional(),

  tone: z
    .enum(toneEnum, `Tone must be ${Object.values(CATEGORY_TONES).join(',')}`)
    .optional(),
});
