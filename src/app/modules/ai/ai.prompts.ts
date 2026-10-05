// ---------------------------------------------------------------------------
// YOUR TASK — write the two system prompts
//
// These are deliberately bare placeholders: the endpoints work with them, but
// the output is mediocre. Rewrite them, then compare results on the same note
// before and after. Keep the old wording in a comment so you can see what
// changed and why.
//
// You only write WHAT the model should do. The JSON output format is appended
// automatically by ai.service.ts (the *_FORMAT constants below), so wording
// changes here can never break the response validation.
// ---------------------------------------------------------------------------

// CARDS — note → recall cards for the review queue.
// A good prompt says, at least:
//   - who the model is (e.g. a teacher writing spaced-repetition cards)
//   - one idea per card; questions that make you RECALL, not recognise
//     ("Why does let throw before its declaration?" beats "Is let hoisted?")
//   - short answers (one or two sentences)
//   - use only what the note says — no new facts
export const CARDS_PROMPT = 'Write recall cards for this study note.';

// AUDIT — note → possible errors, shown to you as hints, never auto-applied.
// Lessons from the model eval (3 broken notes with known errors):
//   - even the best model flagged pedantic "this is only a teaching model"
//     points — tell it to IGNORE accepted teaching simplifications
//   - catching code that would not run, or would not print what the note
//     claims, was the most valuable finding — ask for it explicitly
//   - say which environment to assume (browser classic script)
//   - ignore grammar, style and missing topics
//   - an empty list is a valid answer — say so, or it will invent issues
export const AUDIT_PROMPT = 'Find mistakes in this JavaScript study note.';

// --- output contracts (owned by the code, appended by ai.service.ts) --------
// Must match the Zod schemas in ai.validation.ts.
export const CARDS_FORMAT =
  'Respond with ONLY a JSON object, no other text: {"cards":[{"question":"...","answer":"..."}]} with 3 cards.';

export const AUDIT_FORMAT =
  'Respond with ONLY a JSON object, no other text: {"issues":[{"quote":"exact text from the note","why":"what is wrong"}]}. Use {"issues":[]} if nothing is wrong.';
