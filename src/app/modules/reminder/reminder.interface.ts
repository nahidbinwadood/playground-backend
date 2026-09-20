export const REMINDER_SLOTS = ['18', '22', '23'] as const;

export type TReminderSlot = (typeof REMINDER_SLOTS)[number];

// One document per day+slot — the idempotency claim. The compound unique index
// in the model is what makes a retried scheduler invocation a no-op.
export interface IReminderLog {
  dateKey: string; // YYYY-MM-DD in the reminder timezone, NOT UTC
  slot: TReminderSlot;
  streak?: number; // the streak that was at risk when the message went out
  sentAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Singleton doc — the future "I'm on holiday, stop guilting me" switch.
export interface IReminderSetting {
  pauseUntil?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}
