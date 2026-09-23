import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatusCode from 'http-status-codes';
import { AppError } from '../../errorHelpers/appError';
import { envVars } from '../../config/env';
import { ReminderServices } from './reminder.service';

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
      throw new AppError(
        httpStatusCode.UNAUTHORIZED,
        'Invalid reminder secret'
      );
    }

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

export const ReminderControllers = {
  checkReminders,
};
