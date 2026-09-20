import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatusCode from 'http-status-codes';
import { AppError } from '../../errorHelpers/appError';
import { envVars } from '../../config/env';
import { ReminderServices } from './reminder.service';

// check reminders — called by the external scheduler ==>
const checkReminders = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // the scheduler has no JWT, so this endpoint is gated by a shared secret
    // header instead of checkAuth. timingSafeEqual stops request timing from
    // leaking the secret; the length check comes first because
    // timingSafeEqual throws on unequal lengths.
    const provided = req.headers['x-reminder-secret'];
    const providedBuffer = Buffer.from(
      typeof provided === 'string' ? provided : ''
    );
    const expectedBuffer = Buffer.from(envVars.REMINDER_SECRET);

    if (
      providedBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
    ) {
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
