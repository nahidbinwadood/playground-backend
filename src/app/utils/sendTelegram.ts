import { envVars } from '../config/env';
import { AppError } from '../errorHelpers/appError';
import httpStatusCode from 'http-status-codes';

// Provider abstraction — Telegram today, swappable later (e.g. back to a
// WhatsApp gateway) without touching the reminder logic. That seam is the
// reason this function exists at all.
//
// https://core.telegram.org/bots/api#sendmessage
export const sendTelegram = async (text: string): Promise<void> => {
  // POST with a JSON body rather than a query string: nothing to percent-encode
  // wrong, and the message never lands in a proxy's URL log. The bot token is
  // still in the path — never log this URL.
  const response = await fetch(
    `https://api.telegram.org/bot${envVars.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // no parse_mode on purpose — plain text needs no MarkdownV2 escaping, and
      // an escaping slip would fail the send outright, not just look wrong
      body: JSON.stringify({
        chat_id: envVars.TELEGRAM_CHAT_ID,
        text,
      }),
      // a hung request must not stall the serverless invocation
      signal: AbortSignal.timeout(15_000),
    }
  );

  // Telegram reports failures as { ok: false, description } — usually with a
  // 4xx, but the body is the authoritative signal, so check both
  const body = (await response.json().catch(() => null)) as {
    ok?: boolean;
    description?: string;
  } | null;

  if (!response.ok || !body?.ok) {
    console.error(
      'Telegram send failed:',
      response.status,
      body?.description ?? '(unparseable body)'
    );
    throw new AppError(
      httpStatusCode.BAD_GATEWAY,
      'Failed to send the Telegram reminder'
    );
  }
};
