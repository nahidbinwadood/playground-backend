import bcrypt from 'bcryptjs';
import request from 'supertest';
import app from '../src/app';
import { User } from '../src/app/modules/user/user.model';
import { Category } from '../src/app/modules/category/category.model';

export const PASSWORD = 'Str0ng!Pass';

export const createUser = async ({ email, role = 'user' }) => {
  return await User.create({
    name: role === 'admin' ? 'Admin Person' : 'Plain Person',
    email,
    password: await bcrypt.hash(PASSWORD, 4),
    role,
  });
};

export const login = async (email, password = PASSWORD) => {
  return await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password });
};

export const accessTokenFor = async (email) => {
  const res = await login(email);
  if (res.status !== 200) {
    throw new Error(`login failed for ${email}: ${res.status}`);
  }
  return res.body.data.tokens.accessToken;
};

export const createCategory = async (name = 'Frontend') => {
  return await Category.create({ name });
};
