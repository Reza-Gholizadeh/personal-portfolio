/**
 * Metadata for the terminal's /blog listing and its `/blog <slug>` links. The
 * prose itself lives in blog/src/content/posts/*.md — a separate Astro
 * project renders it as real, crawlable HTML. This file only mirrors what
 * the terminal needs to render its panel and build a link, hand-kept in sync
 * with each post's frontmatter. At roughly one post a year, that is simpler
 * than a script that regenerates this file from the Astro content
 * collection.
 */
export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  tags: readonly string[];
  /** Computed at ~200wpm against the Markdown prose; update if a post is
      substantially edited. */
  readingTime: string;
};

export const posts: readonly PostMeta[] = [
  {
    slug: 'monorepo-ci-pipeline',
    title: 'How We Cut Our Monorepo CI Pipeline from 12 Minutes to 2 Minutes',
    date: '2026-09-01',
    tags: ['CI', 'Turborepo', 'Monorepo'],
    readingTime: '3 min read',
  },
];
