import { Model, Types } from 'mongoose';

export interface INote {
  blog?: Types.ObjectId | null; // ref 'Blog'; null = standalone entry
  title: string; // prefilled from blog.title; owner may override
  description?: string;
  content: string; // the handwritten body
  category: Types.ObjectId; // ref 'Category' — own copy on the note, not inherited
  isPublished: boolean; // default false; the future public switch
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NoteModel extends Model<INote> {}
