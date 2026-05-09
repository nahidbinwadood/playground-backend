export const USER_ROLE = ['admin', 'user'] as const;

export type TRole=(typeof USER_ROLE)[number]

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: TRole;
}
