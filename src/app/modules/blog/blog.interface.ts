import { Model, Types } from 'mongoose';

export enum BlogStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

// BlogTypes used to live here as the topic enum. It is gone: the topic is now a
// reference to a Category document, and keeping the enum would leave two sources
// of truth for the same axis.

export interface IBlog {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  author: Types.ObjectId;
  status: BlogStatus;
  category: Types.ObjectId; // ref 'Category' — the topic axis
  isDeleted: boolean;
  isPublished: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deleteImageUrl?: string;
}

export interface BlogModel extends Model<IBlog> {}
