const WORDS_PER_MINUTE = 200;

/**
 * Mirrors the deleted src/data/blog.ts readingTime(): derived from the body
 * so it can't drift when a post is edited.
 */
export function readingTime(body: string): string {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / WORDS_PER_MINUTE))} min read`;
}
