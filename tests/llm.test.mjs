import request from 'supertest';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import app from '../src/app';
import { envVars } from '../src/app/config/env';
import { Note } from '../src/app/modules/note/note.model';
import {
  LLMHttpError,
  extractJSON,
  withRetry,
} from '../src/app/utils/llm';
import { accessTokenFor, createCategory, createUser } from './helpers.mjs';

// an OpenAI-format chat-completions response carrying `content`
const completion = (content) =>
  new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

const upstreamError = (status) =>
  new Response(JSON.stringify({ error: { code: status, message: 'nope' } }), {
    status,
  });

// no real provider is ever called from a test
let fetchMock;
beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('extractJSON', () => {
  it('parses plain JSON', () => {
    expect(extractJSON('{"a":1}')).toEqual({ a: 1 });
  });

  it('parses JSON inside a ```json fence', () => {
    expect(extractJSON('Here you go:\n```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it('parses JSON with prose around it', () => {
    expect(extractJSON('Sure! {"a":1} Hope that helps.')).toEqual({ a: 1 });
  });

  it('rejects an empty reply with a clear message', () => {
    expect(() => extractJSON('')).toThrow('The model returned an empty response');
  });

  it('rejects non-JSON', () => {
    expect(() => extractJSON('no json here')).toThrow(
      'The model did not return valid JSON'
    );
  });
});

describe('AI routes', () => {
  let adminToken;
  let noteId;

  beforeAll(async () => {
    await createUser({ email: 'admin@ai.test', role: 'admin' });
    adminToken = await accessTokenFor('admin@ai.test');

    const category = await createCategory('Javascript');
    const note = await Note.create({
      title: 'Hoisting',
      content: 'var is initialized to undefined in the creation phase.',
      category: category._id,
    });
    noteId = note._id.toString();
  });

  const cards = () =>
    request(app)
      .post(`/api/v1/ai/notes/${noteId}/cards`)
      .set('Authorization', `Bearer ${adminToken}`);

  it('rejects a request without a token', async () => {
    const res = await request(app).post(`/api/v1/ai/notes/${noteId}/cards`);

    expect(res.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns validated cards and sends the note to the fast model', async () => {
    fetchMock.mockResolvedValue(
      completion('{"cards":[{"question":"What is var before assignment?","answer":"undefined"}]}')
    );

    const res = await cards();

    expect(res.status).toBe(200);
    expect(res.body.data.cards).toHaveLength(1);

    const [url, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(init.body);
    expect(url).toBe('https://llm.test/v1/chat/completions');
    expect(body.model).toBe('test/fast-model');
    expect(body.max_tokens).toBeGreaterThan(0);
    expect(body.messages[1].content).toContain('creation phase');
  });

  it('audit uses the strong model', async () => {
    fetchMock.mockResolvedValue(completion('{"issues":[]}'));

    const res = await request(app)
      .post(`/api/v1/ai/notes/${noteId}/audit`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.issues).toEqual([]);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).model).toBe(
      'test/strong-model'
    );
  });

  it('answers 502 when the model returns the wrong shape', async () => {
    fetchMock.mockResolvedValue(completion('{"cards":"not an array"}'));

    const res = await cards();

    expect(res.status).toBe(502);
  });

  it('answers 502 on an upstream error and never leaks the key', async () => {
    fetchMock.mockResolvedValue(upstreamError(402));

    const res = await cards();

    expect(res.status).toBe(502);
    expect(JSON.stringify(res.body)).not.toContain('test-llm-key');
  });

  it('answers 503 when AI is not configured', async () => {
    const saved = envVars.LLM_API_KEY;
    envVars.LLM_API_KEY = undefined;

    try {
      const res = await cards();

      expect(res.status).toBe(503);
      expect(fetchMock).not.toHaveBeenCalled();
    } finally {
      envVars.LLM_API_KEY = saved;
    }
  });

  it('answers 404 for an invalid note id without calling the model', async () => {
    const res = await request(app)
      .post('/api/v1/ai/notes/not-an-id/cards')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// YOUR TASK — the spec for withRetry (src/app/utils/llm.ts).
// Remove `.skip` from each test, run `pnpm test`, then implement until green.
// baseDelayMs: 1 keeps the suite fast; the last test checks the doubling.
// ---------------------------------------------------------------------------
describe('withRetry', () => {
  const opts = { maxAttempts: 3, baseDelayMs: 1 };

  it.skip('returns the first successful result without retrying', async () => {
    const attempt = vi.fn().mockResolvedValue('ok');

    await expect(withRetry(attempt, opts)).resolves.toBe('ok');
    expect(attempt).toHaveBeenCalledTimes(1);
  });

  it.skip('retries a 429 and then succeeds', async () => {
    const attempt = vi
      .fn()
      .mockRejectedValueOnce(new LLMHttpError(429, 'rate limited'))
      .mockResolvedValue('ok');

    await expect(withRetry(attempt, opts)).resolves.toBe('ok');
    expect(attempt).toHaveBeenCalledTimes(2);
  });

  it.skip('retries a 5xx', async () => {
    const attempt = vi
      .fn()
      .mockRejectedValueOnce(new LLMHttpError(503, 'overloaded'))
      .mockResolvedValue('ok');

    await expect(withRetry(attempt, opts)).resolves.toBe('ok');
    expect(attempt).toHaveBeenCalledTimes(2);
  });

  it.skip('does NOT retry a 402 (no credit) — retrying cannot fix it', async () => {
    const attempt = vi.fn().mockRejectedValue(new LLMHttpError(402, 'no credit'));

    await expect(withRetry(attempt, opts)).rejects.toThrow('no credit');
    expect(attempt).toHaveBeenCalledTimes(1);
  });

  it.skip('does NOT retry an error that is not an LLMHttpError', async () => {
    const attempt = vi.fn().mockRejectedValue(new Error('bad JSON'));

    await expect(withRetry(attempt, opts)).rejects.toThrow('bad JSON');
    expect(attempt).toHaveBeenCalledTimes(1);
  });

  it.skip('gives up after maxAttempts and rethrows the last error', async () => {
    const attempt = vi
      .fn()
      .mockRejectedValueOnce(new LLMHttpError(429, 'first'))
      .mockRejectedValueOnce(new LLMHttpError(503, 'second'))
      .mockRejectedValueOnce(new LLMHttpError(503, 'third'));

    await expect(withRetry(attempt, opts)).rejects.toThrow('third');
    expect(attempt).toHaveBeenCalledTimes(3);
  });

  it.skip('doubles the delay between attempts', async () => {
    const delays = [];
    const realSetTimeout = globalThis.setTimeout;
    vi.spyOn(globalThis, 'setTimeout').mockImplementation((fn, ms) => {
      delays.push(ms);
      return realSetTimeout(fn, 0);
    });

    const attempt = vi
      .fn()
      .mockRejectedValueOnce(new LLMHttpError(429, 'a'))
      .mockRejectedValueOnce(new LLMHttpError(429, 'b'))
      .mockResolvedValue('ok');

    await withRetry(attempt, { maxAttempts: 3, baseDelayMs: 100 });

    expect(delays).toEqual([100, 200]);
    vi.restoreAllMocks();
  });
});
