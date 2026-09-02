import { posts } from '../data/blog';
import * as resume from '../data/resume';
import type { Command, CommandContext, OutputLine } from './types';

/** Section header plus its underline — every command opens with one. */
const heading = (text: string): OutputLine[] => [{ kind: 'heading', text }, { kind: 'rule' }];

/** Joins record blocks with a blank line between them, but not before the first. */
function joinBlocks<T>(items: readonly T[], toLines: (item: T) => OutputLine[]): OutputLine[] {
  return items.flatMap((item, index) =>
    index === 0 ? toLines(item) : [{ kind: 'blank' }, ...toLines(item)],
  );
}

const renderAbout = (): OutputLine[] => [
  ...heading('about'),
  { kind: 'text', text: resume.profile.summary },
  { kind: 'blank' },
  { kind: 'kv', key: 'name', value: resume.profile.name },
  { kind: 'kv', key: 'role', value: resume.profile.role },
  { kind: 'kv', key: 'stack', value: resume.profile.stack },
  { kind: 'kv', key: 'location', value: resume.profile.location },
  { kind: 'kv', key: 'status', value: resume.profile.available },
  { kind: 'blank' },
  { kind: 'text', text: resume.profile.interests, tone: 'dim' },
];

const renderExperience = (): OutputLine[] => [
  ...heading('experience'),
  ...joinBlocks(resume.experience, (job) => [
    { kind: 'meta', left: `${job.role} @ ${job.company}`, right: job.period },
    { kind: 'text', text: job.location, tone: 'dim' },
    { kind: 'blank' },
    { kind: 'text', text: job.summary },
    { kind: 'blank' },
    ...job.blocks.map((block): OutputLine => ({ kind: 'tagged', tag: block.tag, body: block.body })),
  ]),
];

const renderProjects = (): OutputLine[] => [
  ...heading('projects'),
  ...joinBlocks(resume.projects, (project) => [
    { kind: 'meta', left: project.name, right: project.period },
    ...(project.url ? [{ kind: 'kv', key: 'url', value: project.url, href: project.url } as OutputLine] : []),
    { kind: 'blank' },
    ...project.blocks.map((block): OutputLine => ({ kind: 'tagged', tag: block.tag, body: block.body })),
  ]),
];

const renderSkills = (): OutputLine[] => [
  ...heading('skills'),
  ...resume.skillGroups.map((group): OutputLine => ({
    kind: 'tags',
    label: group.category,
    items: group.skills,
  })),
];

const renderEducation = (): OutputLine[] => [
  ...heading('education'),
  ...joinBlocks(resume.education, (entry) => [
    { kind: 'meta', left: entry.degree, right: entry.period },
    { kind: 'text', text: entry.institution, tone: 'dim' },
  ]),
];

const renderContact = (): OutputLine[] => [
  ...heading('contact'),
  ...resume.contact.map((item): OutputLine => ({
    kind: 'kv',
    key: item.label,
    value: item.value,
    href: item.href,
  })),
  { kind: 'blank' },
  { kind: 'text', text: resume.profile.available, tone: 'dim' },
];

/**
 * Reports what this page adapted to about the visit, rather than everything the
 * browser could be made to disclose. Rows that only Chromium exposes are
 * omitted where unavailable instead of printed as "unknown".
 */
const renderEnv = ({ env }: CommandContext): OutputLine[] => [
  ...heading('env'),
  { kind: 'kv', key: 'viewport', value: env.viewport },
  { kind: 'kv', key: 'display', value: env.display },
  { kind: 'kv', key: 'motion', value: env.motion },
  { kind: 'kv', key: 'language', value: env.language },
  { kind: 'kv', key: 'timezone', value: env.timezone },
  ...(env.platform ? [{ kind: 'kv', key: 'platform', value: env.platform } as OutputLine] : []),
  ...(env.network ? [{ kind: 'kv', key: 'network', value: env.network } as OutputLine] : []),
  { kind: 'blank' },
  {
    kind: 'text',
    text: 'Read live from your browser and rendered here. This site is static, has no backend and no analytics — none of it is sent anywhere.',
    tone: 'dim',
  },
];

const findPost = (slug: string) => posts.find((post) => post.slug === slug.toLowerCase());

/** The real, crawlable URL a post lives at — served by the sibling Astro project. */
const postHref = (slug: string): string => `${import.meta.env.BASE_URL}blog/${slug}/`;

/**
 * The index. Opening a post is handled by `opens` below, which hands the reader
 * to the full-screen reading view rather than printing the article inline.
 */
const renderBlog = ({ args }: CommandContext): OutputLine[] => {
  const [slug] = args;

  if (slug && !findPost(slug)) {
    return [
      { kind: 'text', text: `bash: ${slug}: no such post`, tone: 'error' },
      { kind: 'text', text: 'Type /blog to list available posts.', tone: 'dim' },
    ];
  }

  return [
    {
      kind: 'panel',
      label: 'blog',
      lines: [
        {
          kind: 'text',
          text: `${posts.length} ${posts.length === 1 ? 'post' : 'posts'}. Type /blog <slug> to open one.`,
          tone: 'dim',
        },
        ...posts.map((post, i): OutputLine => ({
          kind: 'postEntry',
          ordinal: String(i + 1).padStart(2, '0'),
          date: post.date,
          readingTime: post.readingTime,
          command: `/blog ${post.slug}`,
          href: postHref(post.slug),
          title: post.title,
          tags: post.tags,
        })),
      ],
    },
  ];
};

// Reads `registry` below at call time, never at module load — the listing stays
// the single source of truth, including /help's own description.
const renderHelp = (): OutputLine[] => [
  ...heading('help'),
  ...registry.map((command): OutputLine => ({ kind: 'cmd', name: command.name, desc: command.desc })),
  { kind: 'blank' },
  { kind: 'text', text: 'Tab completes · ↑ ↓ cycles history · /clear resets', tone: 'dim' },
];

export const registry: readonly Command[] = [
  { name: '/about', desc: 'bio, role, stack, location', quick: true, run: renderAbout },
  { name: '/experience', desc: 'roles and what I shipped', quick: true, run: renderExperience },
  { name: '/projects', desc: 'selected side work', quick: true, run: renderProjects },
  {
    name: '/blog',
    desc: 'writing — /blog to list, /blog <slug> to read',
    quick: true,
    run: renderBlog,
    opens: ({ args }) => (args[0] && findPost(args[0]) ? postHref(findPost(args[0])!.slug) : null),
    completions: () => posts.map((post) => post.slug),
  },
  { name: '/skills', desc: 'stack by category', quick: true, run: renderSkills },
  { name: '/education', desc: 'degrees', run: renderEducation },
  { name: '/env', desc: 'what this page detected about your browser', run: renderEnv },
  { name: '/contact', desc: 'all contact details', quick: true, run: renderContact },
  { name: '/help', desc: 'this command menu', quick: true, run: renderHelp },
  {
    name: '/clear',
    desc: 'wipe the terminal back to the boot screen',
    quick: true,
    resets: true,
    run: () => [],
  },
];

export const quickCommands = registry.filter((command) => command.quick);

/** Splits `/blog 1` into its command name and the words that follow it. */
export function parseInput(raw: string): { name: string; args: string[] } {
  const [name = '', ...args] = raw.trim().split(/\s+/);
  return { name: name.toLowerCase(), args };
}

export function findCommand(raw: string): Command | undefined {
  const { name } = parseInput(raw);
  return registry.find((command) => command.name === name);
}

/**
 * First command that `raw` is a strict prefix of, for the inline ghost text.
 * Returns null once the input already matches a command exactly.
 *
 * Callers render the suffix as `completion.slice(raw.length)`, which is only
 * correct while the match is index-aligned with the raw input. Trimming would
 * break that alignment, so surrounding whitespace suppresses the suggestion
 * outright — a trailing space reads as "this token is finished" anyway.
 * Case still completes, since lowercasing preserves length.
 */
/**
 * The ghost completion. Handles both halves of an input: the command name
 * before the first space, and the first argument after it — so `/blog mo`
 * completes to a post slug without the reader typing the whole thing.
 *
 * Always returns `raw` plus the missing tail, never a re-cased string: the view
 * slices this against the raw input, so any divergence would misalign the ghost.
 */
export function completionFor(raw: string): string | null {
  const typed = raw.toLowerCase();
  if (!typed.startsWith('/')) return null;

  const space = typed.indexOf(' ');

  if (space === -1) {
    if (typed.length < 2) return null;
    const name = registry.find((c) => c.name.startsWith(typed) && c.name !== typed)?.name;
    return name ? raw + name.slice(typed.length) : null;
  }

  const command = registry.find((c) => c.name === typed.slice(0, space));
  const partial = typed.slice(space + 1);
  if (partial.includes(' ')) return null;

  const match = command?.completions?.().find((v) => v.startsWith(partial) && v !== partial);
  return match ? raw + match.slice(partial.length) : null;
}

export function unknownCommand(raw: string): OutputLine[] {
  return [
    { kind: 'text', text: `bash: ${raw}: command not found`, tone: 'error' },
    { kind: 'text', text: 'Type /help to see available commands.', tone: 'dim' },
  ];
}

export const bootLines: readonly OutputLine[] = [
  { kind: 'text', text: `${resume.profile.name} — ${resume.profile.role}`, tone: 'accent' },
  { kind: 'text', text: resume.profile.stack, tone: 'dim' },
  { kind: 'blank' },
  { kind: 'text', text: 'Interactive résumé. Type a command to begin.' },
  { kind: 'text', text: 'Start with /about, or /help for the full menu.', tone: 'dim' },
];
