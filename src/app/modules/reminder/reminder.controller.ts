import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatusCode from 'http-status-codes';
import { AppError } from '../../errorHelpers/appError';
import { envVars } from '../../config/env';
import { ReminderServices } from './reminder.service';
import { sendTelegram } from '../../utils/sendTelegram';

// Constant-time secret comparison. Timing-safe equality stops response timing
// from leaking the secret character by character. The length check comes first
// because timingSafeEqual throws on unequal lengths.
const secretMatches = (provided: string, expected: string): boolean => {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  return (
    providedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  );
};

// Throws 401 unless the request carries a valid scheduler credential.
// Shared by /check and /demo so both are gated identically.
const assertScheduler = (req: Request) => {
  const secretHeader = req.headers['x-reminder-secret'];
  const authHeader = req.headers['authorization'];

  const hasValidReminderSecret =
    typeof secretHeader === 'string' &&
    secretMatches(secretHeader, envVars.REMINDER_SECRET);

  // Vercel only sends the header if CRON_SECRET is configured; without it the
  // bearer path stays closed rather than matching an empty secret.
  const cronSecret = envVars.CRON_SECRET;
  const hasValidCronBearer =
    Boolean(cronSecret) &&
    typeof authHeader === 'string' &&
    secretMatches(authHeader, `Bearer ${cronSecret}`);

  if (!hasValidReminderSecret && !hasValidCronBearer) {
    throw new AppError(httpStatusCode.UNAUTHORIZED, 'Invalid reminder secret');
  }
};

// check reminders — called by a scheduler (Vercel Cron, or an external one) ==>
const checkReminders = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // the scheduler has no JWT, so this endpoint is gated by a shared secret
    // instead of checkAuth. Two credentials are accepted because the two kinds
    // of scheduler cannot send the same header:
    //
    //   1. x-reminder-secret — external schedulers (cron-job.org, GitHub
    //      Actions, a VPS crontab) can set arbitrary headers.
    //   2. Authorization: Bearer <CRON_SECRET> — Vercel Cron cannot set custom
    //      headers; Vercel injects this one automatically when a CRON_SECRET
    //      env var exists on the project.
    //
    // Either one is sufficient, and neither is ever compared with ===.
    assertScheduler(req);

    const result = await ReminderServices.runReminderCheck();

    sendResponse(res, {
      success: true,
      statusCode: httpStatusCode.OK,
      message: result.sent
        ? `Reminder sent for slot ${result.slot}`
        : `No reminder sent (${result.reason})`,
      data: result,
    });
  }
);

// demo ping — sends a timestamped test message on every call, no slot or
// note checks. For trying out a scheduler (e.g. cron-job.org every minute).
// Same secret as /check, so strangers cannot spam the chat.
const sendDemo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    assertScheduler(req);

    const sentAt = new Date().toLocaleString('en-GB', {
      timeZone: envVars.REMINDER_TZ,
    });
    await sendTelegram(`🧪 Demo ping — ${sentAt} (${envVars.REMINDER_TZ})`);

    sendResponse(res, {
      success: true,
      statusCode: httpStatusCode.OK,
      message: 'Demo message sent',
      data: { sentAt },
    });
  }
);

export const ReminderControllers = {
  checkReminders,
  sendDemo,
};
