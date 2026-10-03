import { model, Schema } from 'mongoose';
import { INote, NoteModel, NOTE_STATUSES } from './note.interface';

// same _id → id transform as blog.model.ts, so the frontend keeps receiving
// `id` instead of `_id`
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

const noteSchema = new Schema<INote>(
  {
    blog: {
      type: Schema.Types.ObjectId,
      ref: 'Blog',
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    // topic axis — the note's own copy of the category, not inherited from the
    // blog it is attached to
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    // the lifecycle flag. Defaults to DRAFT on purpose: every note that already
    // exists, and every new one, stays private until it is explicitly completed.
    status: {
      type: String,
      enum: NOTE_STATUSES,
      default: 'DRAFT',
    },

    // written false from day one so going public later is a query change,
    // not a migration
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

export const Note = model<INote, NoteModel>('Note', noteSchema);
