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
exports.sendTelegram = void 0;
const env_1 = require("../config/env");
const appError_1 = require("../errorHelpers/appError");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
// Provider abstraction — Telegram today, swappable later (e.g. back to a
// WhatsApp gateway) without touching the reminder logic. That seam is the
// reason this function exists at all.
//
// https://core.telegram.org/bots/api#sendmessage
const sendTelegram = (text) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // POST with a JSON body rather than a query string: nothing to percent-encode
    // wrong, and the message never lands in a proxy's URL log. The bot token is
    // still in the path — never log this URL.
    const response = yield fetch(`https://api.telegram.org/bot${env_1.envVars.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // no parse_mode on purpose — plain text needs no MarkdownV2 escaping, and
        // an escaping slip would fail the send outright, not just look wrong
        body: JSON.stringify({
            chat_id: env_1.envVars.TELEGRAM_CHAT_ID,
            text,
        }),
        // a hung request must not stall the serverless invocation
        signal: AbortSignal.timeout(15000),
    });
    // Telegram reports failures as { ok: false, description } — usually with a
    // 4xx, but the body is the authoritative signal, so check both
    const body = (yield response.json().catch(() => null));
    if (!response.ok || !(body === null || body === void 0 ? void 0 : body.ok)) {
        console.error('Telegram send failed:', response.status, (_a = body === null || body === void 0 ? void 0 : body.description) !== null && _a !== void 0 ? _a : '(unparseable body)');
        throw new appError_1.AppError(http_status_codes_1.default.BAD_GATEWAY, 'Failed to send the Telegram reminder');
    }
});
exports.sendTelegram = sendTelegram;
