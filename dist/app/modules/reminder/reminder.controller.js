"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReminderControllers = void 0;
const crypto_1 = __importDefault(require("crypto"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const appError_1 = require("../../errorHelpers/appError");
const env_1 = require("../../config/env");
const reminder_service_1 = require("./reminder.service");
// Constant-time secret comparison. Timing-safe equality stops response timing
// from leaking the secret character by character. The length check comes first
// because timingSafeEqual throws on unequal lengths.
const secretMatches = (provided, expected) => {
    const providedBuffer = Buffer.from(provided);
    const expectedBuffer = Buffer.from(expected);
    return (providedBuffer.length === expectedBuffer.length &&
        crypto_1.default.timingSafeEqual(providedBuffer, expectedBuffer));
};
// check reminders — called by a scheduler (Vercel Cron, or an external one) ==>
const checkReminders = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
    const hasValidReminderSecret = typeof secretHeader === 'string' &&
        secretMatches(secretHeader, env_1.envVars.REMINDER_SECRET);
    // Vercel only sends the header if CRON_SECRET is configured; without it the
    // bearer path stays closed rather than matching an empty secret.
    const cronSecret = env_1.envVars.CRON_SECRET;
    const hasValidCronBearer = Boolean(cronSecret) &&
        typeof authHeader === 'string' &&
        secretMatches(authHeader, `Bearer ${cronSecret}`);
    if (!hasValidReminderSecret && !hasValidCronBearer) {
        throw new appError_1.AppError(http_status_codes_1.default.UNAUTHORIZED, 'Invalid reminder secret');
    }
    const result = yield reminder_service_1.ReminderServices.runReminderCheck();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: result.sent
            ? `Reminder sent for slot ${result.slot}`
            : `No reminder sent (${result.reason})`,
        data: result,
    });
}));
exports.ReminderControllers = {
    checkReminders,
};
