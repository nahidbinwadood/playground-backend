import { Model, Types } from 'mongoose';
export enum BlogStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export interface IBlog {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  author: Types.ObjectId;
  status: BlogStatus;
  isDeleted: boolean;
  isPublished: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BlogModel extends Model<IBlog> {}
