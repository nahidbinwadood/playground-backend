import { Model, Types } from 'mongoose';

export enum BlogStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export enum BlogTypes {
  FRONTEND = 'FRONTEND',
  BACKEND = 'BACKEND',
  JAVASCRIPT = 'JAVASCRIPT',
}

export interface IBlog {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  author: Types.ObjectId;
  status: BlogStatus;
  type: BlogTypes;
  isDeleted: boolean;
  isPublished: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deleteImageUrl?: string;
}

export interface BlogModel extends Model<IBlog> {}
