"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReminderSetting = exports.ReminderLog = void 0;
const mongoose_1 = require("mongoose");
const reminder_interface_1 = require("./reminder.interface");
const reminderLogSchema = new mongoose_1.Schema({
    dateKey: {
        type: String,
        required: true,
    },
    slot: {
        type: String,
        enum: reminder_interface_1.REMINDER_SLOTS,
        required: true,
    },
    streak: {
        type: Number,
    },
    sentAt: {
        type: Date,
    },
}, {
    timestamps: true,
    versionKey: false,
});
// one send per day+slot — the idempotency claim for scheduler retries
reminderLogSchema.index({ dateKey: 1, slot: 1 }, { unique: true });
const reminderSettingSchema = new mongoose_1.Schema({
    pauseUntil: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
    versionKey: false,
});
exports.ReminderLog = (0, mongoose_1.model)('ReminderLog', reminderLogSchema);
exports.ReminderSetting = (0, mongoose_1.model)('ReminderSetting', reminderSettingSchema);
