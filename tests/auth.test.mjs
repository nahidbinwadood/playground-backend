import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import app from '../src/app';
import { LoginAttempt } from '../src/app/modules/auth/auth.model';
import { User } from '../src/app/modules/user/user.model';
import { verifyToken } from '../src/app/utils/jwt';
import { PASSWORD, createUser, login } from './helpers.mjs';

const EMAIL = 'member@auth.test';
const WRONG = 'Wrong!Pass1';

describe('auth', () => {
  beforeAll(async () => {
    await createUser({ email: EMAIL });
  });

  beforeEach(async () => {
    await LoginAttempt.deleteMany({});
  });

  it('wrong password and unknown email return the same message', async () => {
    const wrongPassword = await login(EMAIL, WRONG);
    const unknownEmail = await login('nobody@auth.test', WRONG);

    expect(wrongPassword.status).toBe(unknownEmail.status);
    expect(wrongPassword.body.message).toBe(unknownEmail.body.message);
    expect(wrongPassword.body.data).toBeUndefined();
  });

  it('locks the email out on the 6th failed attempt with 429', async () => {
    for (let attempt = 1; attempt <= 5; attempt++) {
      const res = await login(EMAIL, WRONG);
      expect(res.status).toBe(400);
    }

    const sixth = await login(EMAIL, WRONG);
    expect(sixth.status).toBe(429);

    // the lock holds even with the right password
    const correct = await login(EMAIL, PASSWORD);
    expect(correct.status).toBe(429);
  });

  it('a successful login clears the failure counter', async () => {
    for (let attempt = 1; attempt <= 3; attempt++) {
      await login(EMAIL, WRONG);
    }
    expect(await LoginAttempt.countDocuments({ email: EMAIL })).toBe(3);

    const res = await login(EMAIL, PASSWORD);
    expect(res.status).toBe(200);
    expect(res.body.data.password).toBeUndefined();
    expect(await LoginAttempt.countDocuments({ email: EMAIL })).toBe(0);
  });

  it('POST /auth/logout works without a token', async () => {
    const res = await request(app).post('/api/v1/auth/logout');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /auth/refresh-token with a valid refresh cookie returns a new pair', async () => {
    const loginRes = await login(EMAIL, PASSWORD);
    const { refreshToken } = loginRes.body.data.tokens;

    const res = await request(app)
      .post('/api/v1/auth/refresh-token')
      .set('Cookie', `refreshToken=${refreshToken}`);

    expect(res.status).toBe(200);
    const { accessToken, refreshToken: newRefresh } = res.body.data;
    expect(verifyToken(accessToken, process.env.JWT_ACCESS_SECRET).email).toBe(
      EMAIL
    );
    expect(verifyToken(newRefresh, process.env.JWT_REFRESH_SECRET).email).toBe(
      EMAIL
    );
    const cookies = res.headers['set-cookie'].join(';');
    expect(cookies).toContain('accessToken=');
    expect(cookies).toContain('refreshToken=');
  });

  it('POST /auth/refresh-token without a cookie is rejected', async () => {
    const res = await request(app).post('/api/v1/auth/refresh-token');

    expect(res.status).toBe(401);
  });
});

describe('signup cannot mint admins', () => {
  it('POST /auth/create with role admin never creates an admin', async () => {
    const res = await request(app).post('/api/v1/auth/create').send({
      name: 'Sneaky',
      email: 'sneaky@auth.test',
      password: 'Sneaky!Pass1',
      role: 'admin',
    });

    const created = await User.findOne({ email: 'sneaky@auth.test' });
    if (res.status === 201) {
      expect(res.body.data.role).toBe('user');
      expect(created.role).toBe('user');
    } else {
      expect(res.status).toBe(400);
      expect(created).toBeNull();
    }
    expect(await User.countDocuments({ role: 'admin' })).toBe(0);
  });

  it('POST /auth/create without a role creates a user', async () => {
    const res = await request(app).post('/api/v1/auth/create').send({
      name: 'Regular',
      email: 'regular@auth.test',
      password: 'Regular!Pass1',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.role).toBe('user');
    expect(res.body.data.password).toBeUndefined();
  });
});
