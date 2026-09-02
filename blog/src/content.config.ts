import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
    // Feeds <meta description>, OG/Twitter cards, and JSON-LD `description` —
    // no equivalent existed in the terminal's old OutputLine[] body, so this
    // is new, hand-authored copy per post.
    description: z.string(),
  }),
});

export const collections = { posts };
