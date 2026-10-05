import { envVars } from '../config/env';
import { AppError } from '../errorHelpers/appError';
import httpStatusCode from 'http-status-codes';

// Provider-agnostic LLM client. Speaks the OpenAI chat-completions format, which
// OpenRouter, Groq, Gemini and Ollama all accept — switching provider or model
// is an env change (LLM_BASE_URL / LLM_API_KEY / LLM_MODEL_*), never a code
// change. Plain fetch on purpose: one function does not justify the openai SDK.
//
// https://openrouter.ai/docs/api-reference/chat-completion

// An upstream failure that carries the provider's HTTP status, so withRetry can
// tell a transient failure (429, 5xx) from a permanent one (400, 401, 402).
// The client always sees 502 — the provider's status is an internal detail.
export class LLMHttpError extends AppError {
  upstreamStatus: number;

  constructor(upstreamStatus: number, message: string) {
    super(httpStatusCode.BAD_GATEWAY, message);
    this.upstreamStatus = upstreamStatus;
  }
}

export const isLLMConfigured = () =>
  Boolean(envVars.LLM_BASE_URL && envVars.LLM_API_KEY);

// ---------------------------------------------------------------------------
// YOUR TASK — retry with exponential backoff
//
// Free models fail often: in the model eval, 429 (rate limited) and 503
// (overloaded) were common, and a second try a few seconds later usually
// worked. Right now this calls `attempt` exactly once. Make it:
//
//   1. retry ONLY when the error is an LLMHttpError whose upstreamStatus is
//      429 or >= 500. Anything else (400 bad request, 401 bad key, 402 no
//      credit, invalid JSON) must throw immediately — retrying cannot fix it.
//   2. try at most `maxAttempts` times in total, then rethrow the last error.
//   3. wait between tries, doubling each time: baseDelayMs, baseDelayMs * 2,
//      baseDelayMs * 4 ...
//
// Hints: a `for` loop + try/catch; `await new Promise((r) => setTimeout(r, ms))`.
// The spec is already written as tests in tests/llm.test.mjs — they are
// skipped (`it.skip`). Remove `.skip`, run `pnpm test`, make them pass.
// ---------------------------------------------------------------------------
export const withRetry = async <T>(
  attempt: () => Promise<T>,
  { maxAttempts = 3, baseDelayMs = 2000 } = {}
): Promise<T> => {
  return attempt();
};

// Models wrap JSON in ```json fences or add a sentence before it, and a
// reasoning model that ran out of tokens returns an empty string. Accept the
// first two; reject the third with a clear error rather than a JSON.parse crash.
export const extractJSON = (text: string): unknown => {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate =
    fenced ?? text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);

  try {
    return JSON.parse(candidate);
  } catch {
    throw new AppError(
      httpStatusCode.BAD_GATEWAY,
      text.trim()
        ? 'The model did not return valid JSON'
        : 'The model returned an empty response'
    );
  }
};

const requestCompletion = async ({
  model,
  system,
  user,
  maxTokens,
  thinking,
}: {
  model: string;
  system: string;
  user: string;
  maxTokens: number;
  // DeepSeek turns thinking mode ON by default, and its reasoning tokens are
  // billed as output. `false` disables it for cheap work, `true` keeps it for
  // accuracy-sensitive work. Omitted (`undefined`) means the provider default.
  // Only sent when set, so other OpenAI-compatible providers stay unaffected.
  thinking?: boolean;
}): Promise<string> => {
  let response: Response;

  try {
    response = await fetch(`${envVars.LLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // the key is only ever in this header — never log the request
        Authorization: `Bearer ${envVars.LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        // always cap it: without max_tokens some providers reserve the model's
        // full output budget and answer 402 on a small balance
        max_tokens: maxTokens,
        ...(thinking === undefined
          ? {}
          : { thinking: { type: thinking ? 'enabled' : 'disabled' } }),
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
      // free models took ~50 s per audit in the eval; past 60 s, give up
      signal: AbortSignal.timeout(60_000),
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new AppError(
        httpStatusCode.GATEWAY_TIMEOUT,
        'The model took too long to answer'
      );
    }
    throw new LLMHttpError(0, 'Could not reach the model provider');
  }

  const body = (await response.json().catch(() => null)) as {
    choices?: { message?: { content?: string | null } }[];
    error?: { message?: string; code?: number };
  } | null;

  // OpenRouter can also report an upstream failure inside a 200 body
  if (!response.ok || body?.error) {
    const status = body?.error?.code ?? response.status;
    console.error('LLM request failed:', status, body?.error?.message);
    throw new LLMHttpError(status, 'The model provider returned an error');
  }

  return body?.choices?.[0]?.message?.content ?? '';
};

// one chat turn whose answer must be a JSON object. Returns `unknown` on
// purpose — callers validate the shape with Zod before trusting it.
export const chatJSON = async ({
  model,
  system,
  user,
  maxTokens = 2000,
  thinking,
}: {
  model: string;
  system: string;
  user: string;
  maxTokens?: number;
  thinking?: boolean;
}): Promise<unknown> => {
  if (!isLLMConfigured()) {
    throw new AppError(
      httpStatusCode.SERVICE_UNAVAILABLE,
      'AI is not configured on this server'
    );
  }

  const text = await withRetry(() =>
    requestCompletion({ model, system, user, maxTokens, thinking })
  );

  return extractJSON(text);
};
