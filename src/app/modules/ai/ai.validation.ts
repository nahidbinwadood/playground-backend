import { z } from 'zod';

// These validate what the MODEL returns, not what a client sends. A model is an
// untrusted source: it can drop fields, return the wrong shape or ramble, so
// nothing it says reaches the client until it passes one of these.

export const cardsResponseSchema = z.object({
  cards: z
    .array(
      z.object({
        question: z.string().trim().min(1),
        answer: z.string().trim().min(1),
      })
    )
    .min(1)
    .max(10),
});

export const auditResponseSchema = z.object({
  issues: z.array(
    z.object({
      quote: z.string().trim().min(1),
      why: z.string().trim().min(1),
    })
  ),
});

export type TCardsResponse = z.infer<typeof cardsResponseSchema>;
export type TAuditResponse = z.infer<typeof auditResponseSchema>;
