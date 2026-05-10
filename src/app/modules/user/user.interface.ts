import { Types } from 'mongoose';

export const USER_ROLE = ['admin', 'user'] as const;

export type TRole = (typeof USER_ROLE)[number];

export enum IsActive {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

export interface IUser {
  id?: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: TRole;
  isActive?: IsActive;
  isDeleted?: boolean;
}
