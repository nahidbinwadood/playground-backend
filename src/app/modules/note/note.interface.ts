import { Model, Types } from 'mongoose';

// The note lifecycle. DRAFT is a private work-in-progress; COMPLETE is the one
// state the public homepage is allowed to show. Uppercase to sit alongside
// IBlog.status so both documents read the same way across both apps.
export const NOTE_STATUSES = ['DRAFT', 'COMPLETE'] as const;

export type TNoteStatus = (typeof NOTE_STATUSES)[number];

export interface INote {
  blog?: Types.ObjectId | null; // ref 'Blog'; null = standalone entry
  title: string; // prefilled from blog.title; owner may override
  description?: string;
  content: string; // the handwritten body
  category: Types.ObjectId; // ref 'Category' — own copy on the note, not inherited
  status: TNoteStatus; // default 'DRAFT' — COMPLETE is what goes public
  isPublished: boolean; // default false; the future public switch
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NoteModel extends Model<INote> {}
