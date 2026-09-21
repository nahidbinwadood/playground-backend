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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReminderServices = void 0;
const env_1 = require("../../config/env");
const note_model_1 = require("../note/note.model");
const sendTelegram_1 = require("../../utils/sendTelegram");
const reminder_model_1 = require("./reminder.model");
// ---------------------------------------------------------------------------
// timezone helpers
//
// A UTC day window mis-classifies late-night entries: at 02:00 Dhaka it is
// still 20:00 UTC the previous day. Everything below works in the reminder
// timezone's wall clock and converts back to UTC instants for Mongo queries.
// ---------------------------------------------------------------------------
const timeZone = () => env_1.envVars.REMINDER_TZ || 'Asia/Dhaka';
// current wall-clock date (YYYY-MM-DD), hour and minute in the reminder zone
const zonedNow = () => {
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: timeZone(),
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).formatToParts(new Date());
    const get = (type) => { var _a, _b; return (_b = (_a = parts.find((part) => part.type === type)) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : '00'; };
    return {
        dateKey: `${get('year')}-${get('month')}-${get('day')}`,
        hour: Number(get('hour')) % 24, // some ICU versions emit "24" at midnight
        minute: Number(get('minute')),
    };
};
// offset (ms) to ADD to a UTC instant to get the zone's wall clock, at that instant
const zoneOffsetMs = (instant) => {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZone(),
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).formatToParts(instant);
    const get = (type) => { var _a, _b; return Number((_b = (_a = parts.find((part) => part.type === type)) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : 0); };
    const asUTC = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'));
    return asUTC - instant.getTime();
};
// UTC instants covering [start, end) of the wall-clock day `dateKey`
const zonedDayRange = (dateKey) => {
    const midnightUTC = Date.parse(`${dateKey}T00:00:00Z`);
    // guess the offset, apply it, re-check — two passes absorb DST-edge rounding
    // (Asia/Dhaka has none, but the helper stays correct if REMINDER_TZ changes)
    let start = new Date(midnightUTC);
    for (let pass = 0; pass < 2; pass++) {
        start = new Date(midnightUTC - zoneOffsetMs(start));
    }
    return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
};
const shiftDateKey = (dateKey, days) => {
    const shifted = Date.parse(`${dateKey}T00:00:00Z`) + days * 24 * 60 * 60 * 1000;
    return new Date(shifted).toISOString().slice(0, 10);
};
// notes with createdAt OR updatedAt inside [start, end)
const countActiveNotesBetween = (start, end) => __awaiter(void 0, void 0, void 0, function* () {
    return yield note_model_1.Note.countDocuments({
        $or: [
            { createdAt: { $gte: start, $lt: end } },
            { updatedAt: { $gte: start, $lt: end } },
        ],
    });
});
// consecutive days with >= 1 note, walking back from yesterday until the first
// empty day — this is the number that makes the 23:00 message land
const computeStreak = (todayKey) => __awaiter(void 0, void 0, void 0, function* () {
    let streak = 0;
    let key = shiftDateKey(todayKey, -1);
    // hard stop after a year so a forever-empty journal can't loop unbounded
    for (let day = 0; day < 366; day++) {
        const { start, end } = zonedDayRange(key);
        const count = yield countActiveNotesBetween(start, end);
        if (count === 0)
            break;
        streak++;
        key = shiftDateKey(key, -1);
    }
    return streak;
});
// ---------------------------------------------------------------------------
// message copy
//
// Plain text on purpose — sendTelegram sends no parse_mode, so emoji, newlines
// and the arrow pass through untouched. MarkdownV2 would require escaping a
// dozen characters and one missed escape fails the send outright.
//
// Every message carries the same three things in the same order: which slot
// this is, what is missing, and what it costs. The streak line is the reason
// the message lands at all, so it is never folded into the sentence above it.
// ---------------------------------------------------------------------------
const SLOT_COPY = {
    '18': {
        header: '📘 Daily log · 18:00',
        body: 'Nothing has been logged today yet.',
    },
    '22': {
        header: '⏳ Daily log · 22:00',
        body: 'Two hours left, and today is still empty.',
    },
    '23': {
        header: '🚨 Daily log · 23:00',
        body: 'Last hour, and today is still empty.',
    },
};
const buildMessage = (slot, streak) => {
    const { header, body } = SLOT_COPY[slot];
    // A streak of 0 is not "at risk" — there is nothing to lose yet, and saying
    // otherwise trains the reader to ignore the number.
    const streakLine = streak > 0
        ? `🔥 Streak at risk: ${streak} ${streak === 1 ? 'day' : 'days'}`
        : '🌱 No streak yet — today starts one';
    return [
        header,
        '',
        body,
        streakLine,
        '',
        'Write one takeaway → /admin/notes',
    ].join('\n');
};
const runReminderCheck = () => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    const { dateKey, hour } = zonedNow();
    // 1. pause check — a holiday should not produce three guilt messages a day
    const setting = yield reminder_model_1.ReminderSetting.findOne();
    if ((setting === null || setting === void 0 ? void 0 : setting.pauseUntil) && setting.pauseUntil > now) {
        return { sent: false, slot: null, reason: 'paused', streak: null };
    }
    // 2. activity check — any note touched inside today's Dhaka window means the
    //    day is already logged
    const { start: dayStart } = zonedDayRange(dateKey);
    const activeToday = yield countActiveNotesBetween(dayStart, now);
    if (activeToday > 0) {
        return { sent: false, slot: null, reason: 'already_logged', streak: null };
    }
    // 3. the most recent slot boundary at or before now — deriving it this way
    //    (instead of matching an exact hour) makes a late or retried invocation
    //    self-correct instead of falling through a gap
    const slot = hour >= 23 ? '23' : hour >= 22 ? '22' : hour >= 18 ? '18' : null;
    if (!slot) {
        return { sent: false, slot: null, reason: 'before_first_slot', streak: null };
    }
    // 4. idempotency — a claim for this day+slot means the message already went out
    const existingClaim = yield reminder_model_1.ReminderLog.findOne({ dateKey, slot });
    if (existingClaim) {
        return { sent: false, slot, reason: 'already_sent', streak: null };
    }
    // 5. the streak at risk
    const streak = yield computeStreak(dateKey);
    // 6. claim BEFORE sending; if the send then fails the claim is released so
    //    a retry can re-attempt
    let claim;
    try {
        claim = yield reminder_model_1.ReminderLog.create({ dateKey, slot, streak, sentAt: now });
    }
    catch (error) {
        // lost a race with a parallel invocation — treat as already sent
        if ((error === null || error === void 0 ? void 0 : error.code) === 11000) {
            return { sent: false, slot, reason: 'already_sent', streak };
        }
        throw error;
    }
    // 7. send
    try {
        yield (0, sendTelegram_1.sendTelegram)(buildMessage(slot, streak));
    }
    catch (error) {
        yield reminder_model_1.ReminderLog.deleteOne({ _id: claim._id });
        throw error;
    }
    // 8. summary — this is how the job is debugged from cron-job.org's response view
    return { sent: true, slot, reason: 'sent', streak };
});
exports.ReminderServices = {
    runReminderCheck,
};
