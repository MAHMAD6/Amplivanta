/**
 * Content Creation disclosure.
 *
 * The Marketplace spec makes this a required field on every listing: a buyer
 * is told how the product was made. The values mirror the ContentCreation enum
 * in the Prisma schema; the server rejects a listing that does not declare one.
 */

export const CONTENT_CREATION = ["HUMAN_CREATED", "AI_ASSISTED", "PRIMARILY_AI_GENERATED"] as const;

export type ContentCreation = (typeof CONTENT_CREATION)[number];

export const CONTENT_CREATION_LABEL: Record<ContentCreation, string> = {
  HUMAN_CREATED: "Human-created",
  AI_ASSISTED: "AI-assisted",
  PRIMARILY_AI_GENERATED: "Primarily AI-generated",
};

export const CONTENT_CREATION_HINT: Record<ContentCreation, string> = {
  HUMAN_CREATED: "Made by people without generative AI producing the content.",
  AI_ASSISTED: "Made by people, with AI used for parts of the work such as drafts or edits.",
  PRIMARILY_AI_GENERATED: "The content was mostly produced by generative AI.",
};

export function isContentCreation(value: unknown): value is ContentCreation {
  return typeof value === "string" && (CONTENT_CREATION as readonly string[]).includes(value);
}
