import { model, Schema } from 'mongoose';
import { IReminderLog, IReminderSetting, REMINDER_SLOTS } from './reminder.interface';

const reminderLogSchema = new Schema<IReminderLog>(
  {
    dateKey: {
      type: String,
      required: true,
    },
    slot: {
      type: String,
      enum: REMINDER_SLOTS,
      required: true,
    },
    streak: {
      type: Number,
    },
    sentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// one send per day+slot — the idempotency claim for scheduler retries
reminderLogSchema.index({ dateKey: 1, slot: 1 }, { unique: true });

const reminderSettingSchema = new Schema<IReminderSetting>(
  {
    pauseUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const ReminderLog = model<IReminderLog>('ReminderLog', reminderLogSchema);

export const ReminderSetting = model<IReminderSetting>(
  'ReminderSetting',
  reminderSettingSchema
);
