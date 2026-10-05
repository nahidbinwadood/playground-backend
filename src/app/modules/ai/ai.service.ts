import { z } from 'zod';
import httpStatusCode from 'http-status-codes';
import { envVars } from '../../config/env';
import { AppError } from '../../errorHelpers/appError';
import { chatJSON } from '../../utils/llm';
import { NoteServices } from '../note/note.service';
import {
  AUDIT_FORMAT,
  AUDIT_PROMPT,
  CARDS_FORMAT,
  CARDS_PROMPT,
} from './ai.prompts';
import { auditResponseSchema, cardsResponseSchema } from './ai.validation';

const requireModel = (model: string | undefined, envName: string) => {
  if (!model) {
    throw new AppError(
      httpStatusCode.SERVICE_UNAVAILABLE,
      `AI is not configured on this server (${envName} is missing)`
    );
  }
  return model;
};

// the model's JSON is untrusted — a wrong shape is the provider's failure, so
// it surfaces as 502, not as a 500 or as bad data reaching the client
const parseModelOutput = <T>(schema: z.ZodType<T>, output: unknown): T => {
  const result = schema.safeParse(output);

  if (!result.success) {
    console.error('LLM output failed validation:', result.error.issues);
    throw new AppError(
      httpStatusCode.BAD_GATEWAY,
      'The model returned an unexpected format'
    );
  }

  return result.data;
};

const noteAsPrompt = (note: { title: string; content: string }) =>
  `Title: ${note.title}\n\n${note.content}`;

// note → recall cards. Returned, not saved: there is no review-card model yet.
const generateCards = async (noteId: string) => {
  const note = await NoteServices.getSingleNote(noteId);

  const output = await chatJSON({
    model: requireModel(envVars.LLM_MODEL_FAST, 'LLM_MODEL_FAST'),
    system: `${CARDS_PROMPT}\n\n${CARDS_FORMAT}`,
    user: noteAsPrompt(note),
  });

  return parseModelOutput(cardsResponseSchema, output);
};

// note → possible errors. Hints for the owner to verify, never applied to the
// note automatically — the eval showed even the best model makes wrong calls.
const auditNote = async (noteId: string) => {
  const note = await NoteServices.getSingleNote(noteId);

  const output = await chatJSON({
    model: requireModel(envVars.LLM_MODEL_STRONG, 'LLM_MODEL_STRONG'),
    system: `${AUDIT_PROMPT}\n\n${AUDIT_FORMAT}`,
    user: noteAsPrompt(note),
    // reasoning models spend tokens thinking before they answer; 2000 left
    // some of them with an empty reply in the eval
    maxTokens: 4000,
  });

  return parseModelOutput(auditResponseSchema, output);
};

export const AIServices = {
  generateCards,
  auditNote,
};
