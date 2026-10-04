import request from 'supertest';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import app from '../src/app';
import { Note } from '../src/app/modules/note/note.model';
import { ReminderLog } from '../src/app/modules/reminder/reminder.model';
import { sendTelegram } from '../src/app/utils/sendTelegram';
import { createCategory } from './helpers.mjs';

// REMINDER_TZ is Asia/Dhaka (UTC+6, no DST)
const dhaka = (hhmm) => new Date(`2026-03-10T${hhmm}:00+06:00`);

const check = () =>
  request(app)
    .get('/api/v1/reminders/check')
    .set('x-reminder-secret', process.env.REMINDER_SECRET);

describe('reminder check', () => {
  let categoryId;

  beforeAll(async () => {
    categoryId = (await createCategory('Habits'))._id;
  });

  beforeEach(async () => {
    await Note.deleteMany({});
    await ReminderLog.deleteMany({});
    vi.mocked(sendTelegram).mockClear();
    // fake only Date so the Mongo driver's timers keep running
    vi.useFakeTimers({ toFake: ['Date'] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('rejects a request without the secret', async () => {
    const res = await request(app).get('/api/v1/reminders/check');

    expect(res.status).toBe(401);
    expect(sendTelegram).not.toHaveBeenCalled();
  });

  it('rejects a wrong secret', async () => {
    const res = await request(app)
      .get('/api/v1/reminders/check')
      .set('x-reminder-secret', 'nope');

    expect(res.status).toBe(401);
    expect(sendTelegram).not.toHaveBeenCalled();
  });

  it('does not send before the first slot', async () => {
    vi.setSystemTime(dhaka('10:00'));

    const res = await check();

    expect(res.status).toBe(200);
    expect(res.body.data.reason).toBe('before_first_slot');
    expect(sendTelegram).not.toHaveBeenCalled();
  });

  it('does not send when a note was written today', async () => {
    vi.setSystemTime(dhaka('09:00'));
    await Note.create({
      title: 'Morning takeaway',
      content: 'logged early',
      category: categoryId,
    });

    vi.setSystemTime(dhaka('18:30'));
    const res = await check();

    expect(res.status).toBe(200);
    expect(res.body.data.reason).toBe('already_logged');
    expect(sendTelegram).not.toHaveBeenCalled();
  });

  it('sends at most once per slot when called twice', async () => {
    vi.setSystemTime(dhaka('18:30'));

    const first = await check();
    const second = await check();

    expect(first.status).toBe(200);
    expect(first.body.data).toMatchObject({ sent: true, slot: '18' });
    expect(second.status).toBe(200);
    expect(second.body.data).toMatchObject({
      sent: false,
      slot: '18',
      reason: 'already_sent',
    });
    expect(sendTelegram).toHaveBeenCalledTimes(1);
  });

  it('releases the claim when the send fails so a retry can send', async () => {
    vi.setSystemTime(dhaka('22:10'));
    vi.mocked(sendTelegram).mockRejectedValueOnce(new Error('telegram down'));

    const failed = await check();
    expect(failed.status).toBe(500);
    expect(await ReminderLog.countDocuments({ slot: '22' })).toBe(0);

    const retry = await check();
    expect(retry.body.data).toMatchObject({ sent: true, slot: '22' });
    expect(sendTelegram).toHaveBeenCalledTimes(2);
  });
});
