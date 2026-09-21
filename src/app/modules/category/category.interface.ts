import { Model } from 'mongoose';

// The tone is a design-system token, not a colour. Storing the token keeps a new
// category from inventing a hue that clashes with the validation palette, and
// lets the frontend own the actual classes.
export const CATEGORY_TONES = ['iris', 'signal', 'warn'] as const;

export type TCategoryTone = (typeof CATEGORY_TONES)[number];

export interface ICategory {
  name: string; // "Frontend" — what the UI shows
  slug: string; // "frontend" — stable handle, generated from the name
  tone: TCategoryTone; // semantic token: iris | signal | warn
  description?: string;
  order: number; // explicit sort key for pickers and tables
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CategoryModel extends Model<ICategory> {}
