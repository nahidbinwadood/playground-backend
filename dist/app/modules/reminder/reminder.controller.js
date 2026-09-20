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
// check reminders — called by the external scheduler ==>
const checkReminders = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // the scheduler has no JWT, so this endpoint is gated by a shared secret
    // header instead of checkAuth. timingSafeEqual stops request timing from
    // leaking the secret; the length check comes first because
    // timingSafeEqual throws on unequal lengths.
    const provided = req.headers['x-reminder-secret'];
    const providedBuffer = Buffer.from(typeof provided === 'string' ? provided : '');
    const expectedBuffer = Buffer.from(env_1.envVars.REMINDER_SECRET);
    if (providedBuffer.length !== expectedBuffer.length ||
        !crypto_1.default.timingSafeEqual(providedBuffer, expectedBuffer)) {
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
