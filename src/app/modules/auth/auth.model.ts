import { model, Schema } from 'mongoose';

// Failed login attempts, one document per failure. Kept in Mongo rather than in
// memory because the API runs on serverless instances that share nothing, and
// keyed by email rather than IP because logins arrive through the frontend's
// server, so every visitor shares one IP. The TTL index cleans up on its own.
export const LOGIN_LOCK_WINDOW_SECONDS = 15 * 60;
export const MAX_FAILED_LOGINS = 5;

const loginAttemptSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

loginAttemptSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: LOGIN_LOCK_WINDOW_SECONDS }
);
loginAttemptSchema.index({ email: 1 });

export const LoginAttempt = model('LoginAttempt', loginAttemptSchema);
