import { randomUUID } from 'crypto';
import { afterAll, beforeAll, inject, vi } from 'vitest';

// src/app/config/env.ts throws at import if any of these is missing, so they
// must be set before any test file imports the app.
const mongoUri = inject('mongoUri');
Object.assign(process.env, {
  PORT: '0',
  DB_URL: `${mongoUri.replace(/\/?$/, '/')}test-${randomUUID()}`,
  NODE_ENV: 'development',
  BCRYPT_SALT_ROUND: '4',
  JWT_ACCESS_SECRET: 'test-access-secret',
  JWT_ACCESS_EXPIRES: '1d',
  JWT_REFRESH_SECRET: 'test-refresh-secret',
  JWT_REFRESH_EXPIRES: '30d',
  FRONTEND_URL_PRODUCTION: 'http://localhost:3000',
  CLOUDINARY_CLOUD_NAME: 'test-cloud',
  CLOUDINARY_API_KEY: 'test-key',
  CLOUDINARY_API_SECRET: 'test-cloudinary-secret',
  TELEGRAM_BOT_TOKEN: 'test-bot-token',
  TELEGRAM_CHAT_ID: 'test-chat-id',
  REMINDER_SECRET: 'test-secret',
  REMINDER_TZ: 'Asia/Dhaka',
  // set explicitly so dotenv can't fill them from a local .env — a real key
  // must never reach a test run. fetch is stubbed in every AI test anyway.
  LLM_BASE_URL: 'https://llm.test/v1',
  LLM_API_KEY: 'test-llm-key',
  LLM_MODEL_STRONG: 'test/strong-model',
  LLM_MODEL_FAST: 'test/fast-model',
});
// a local .env must not open the Vercel bearer path during tests
delete process.env.CRON_SECRET;

// no real Telegram messages, ever
vi.mock('../src/app/utils/sendTelegram', () => ({
  sendTelegram: vi.fn(async () => undefined),
}));

beforeAll(async () => {
  const { connectDB } = await import('../src/app/db/connectDB');
  globalThis.__mongooseConnectPromise = undefined;
  await connectDB(process.env.DB_URL);
});

afterAll(async () => {
  const mongoose = (await import('mongoose')).default;
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  globalThis.__mongooseConnectPromise = undefined;
});
