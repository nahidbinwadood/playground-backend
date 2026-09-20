import { Model, Types } from 'mongoose';
import { BlogTypes } from '../blog/blog.interface';

export interface INote {
  blog?: Types.ObjectId | null; // ref 'Blog'; null = standalone entry
  title: string; // prefilled from blog.title; owner may override
  description?: string;
  content: string; // the handwritten body
  type: BlogTypes; // topic axis — own copy on the note, not inherited
  isPublished: boolean; // default false; the future public switch
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NoteModel extends Model<INote> {}
