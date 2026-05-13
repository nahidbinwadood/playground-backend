import { HydratedDocument, model, Schema } from 'mongoose';
import { generateSlug } from '../../utils/generateSlug';
import { IBlog } from './blog.interface';

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

const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    excerpt: {
      type: String,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: schemaTransform,
    toObject: schemaTransform,
  }
);

blogSchema.pre('save', function (this: HydratedDocument<IBlog>) {
  if (this.isModified('title')) {
    this.slug = generateSlug(this.title);
  }
});

export const Blog = model<IBlog>('Blog', blogSchema);
