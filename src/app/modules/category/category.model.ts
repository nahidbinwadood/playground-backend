import { HydratedDocument, model, Schema } from 'mongoose';
import { generateSlug } from '../../utils/generateSlug';
import {
  CATEGORY_TONES,
  ICategory,
  CategoryModel,
} from './category.interface';

// same _id → id transform as blog.model.ts and note.model.ts, so the frontend
// keeps receiving `id` instead of `_id`
const schemaTransform = {
  virtuals: true,
  transform: (_: any, ret: any) => {
    ret.id = ret._id;
    const transformed = {
      id: ret._id,
      ...ret,
    };

    delete transformed._id;
    delete transformed._v;

    return transformed;
  },
};

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // unique: this is the handle the pickers and the public filter use, so two
    // categories sharing one would be ambiguous everywhere
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    tone: {
      type: String,
      enum: Object.values(CATEGORY_TONES),
      default: 'iris',
    },
    description: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: schemaTransform,
    toObject: schemaTransform,
  }
);

// Renaming regenerates the slug, exactly like a blog title does. Updates go
// through findOneAndUpdate (which skips this hook), so the service sets the slug
// itself on that path.
categorySchema.pre('save', function (this: HydratedDocument<ICategory>) {
  if (this.isModified('name')) {
    this.slug = generateSlug(this.name);
  }
});

export const Category = model<ICategory, CategoryModel>(
  'Category',
  categorySchema
);
