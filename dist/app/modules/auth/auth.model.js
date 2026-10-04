"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginAttempt = exports.MAX_FAILED_LOGINS = exports.LOGIN_LOCK_WINDOW_SECONDS = void 0;
const mongoose_1 = require("mongoose");
// Failed login attempts, one document per failure. Kept in Mongo rather than in
// memory because the API runs on serverless instances that share nothing, and
// keyed by email rather than IP because logins arrive through the frontend's
// server, so every visitor shares one IP. The TTL index cleans up on its own.
exports.LOGIN_LOCK_WINDOW_SECONDS = 15 * 60;
exports.MAX_FAILED_LOGINS = 5;
const loginAttemptSchema = new mongoose_1.Schema({
    email: { type: String, required: true, lowercase: true, trim: true },
    createdAt: { type: Date, default: Date.now },
}, { versionKey: false });
loginAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: exports.LOGIN_LOCK_WINDOW_SECONDS });
loginAttemptSchema.index({ email: 1 });
exports.LoginAttempt = (0, mongoose_1.model)('LoginAttempt', loginAttemptSchema);
