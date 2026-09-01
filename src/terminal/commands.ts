import * as resume from '../data/resume';
import type { Command, OutputLine } from './types';

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
  { name: '/skills', desc: 'stack by category', quick: true, run: renderSkills },
  { name: '/education', desc: 'degrees', run: renderEducation },
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

const normalize = (raw: string) => raw.trim().toLowerCase();

export function findCommand(raw: string): Command | undefined {
  const name = normalize(raw);
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
export function completionFor(raw: string): string | null {
  if (raw !== raw.trim()) return null;
  const typed = raw.toLowerCase();
  if (!typed.startsWith('/') || typed.length < 2) return null;
  return registry.find((c) => c.name.startsWith(typed) && c.name !== typed)?.name ?? null;
}

export function unknownCommand(raw: string): OutputLine[] {
  return [
    { kind: 'text', text: `command not found: ${raw}`, tone: 'accent' },
    { kind: 'text', text: 'type /help to see everything this terminal knows.', tone: 'dim' },
  ];
}

export const bootLines: readonly OutputLine[] = [
  { kind: 'text', text: `${resume.profile.name} — ${resume.profile.role}`, tone: 'accent' },
  { kind: 'text', text: resume.profile.stack, tone: 'dim' },
  { kind: 'blank' },
  { kind: 'text', text: 'Interactive résumé. Type a command to begin.' },
  { kind: 'text', text: 'Start with /about, or /help for the full menu.', tone: 'dim' },
];
