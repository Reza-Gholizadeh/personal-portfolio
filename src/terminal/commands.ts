import {
  contact,
  education,
  experience,
  profile,
  projects,
  skillGroups,
  stats,
} from '../data/resume';
import type { Node } from './types';

export type Command = {
  name: string;
  desc: string;
  /** Shown in the footer quick-launch bar. */
  quick?: boolean;
  run: () => Node[];
};

const heading = (text: string): Node[] => [{ kind: 'heading', text }, { kind: 'rule' }];

const about = (): Node[] => [
  ...heading('about'),
  { kind: 'text', text: profile.summary },
  { kind: 'blank' },
  { kind: 'kv', key: 'name', value: profile.name },
  { kind: 'kv', key: 'role', value: profile.role },
  { kind: 'kv', key: 'stack', value: profile.stack },
  { kind: 'kv', key: 'location', value: profile.location },
  { kind: 'kv', key: 'status', value: profile.available },
];

const experienceCmd = (): Node[] => {
  const nodes: Node[] = [...heading('experience')];
  experience.forEach((job, i) => {
    if (i > 0) nodes.push({ kind: 'blank' });
    nodes.push({ kind: 'meta', left: `${job.role} @ ${job.company}`, right: job.period });
    nodes.push({ kind: 'text', text: job.location, tone: 'dim' });
    nodes.push({ kind: 'blank' });
    job.blocks.forEach((b) => nodes.push({ kind: 'tagged', tag: b.tag, body: b.body }));
  });
  return nodes;
};

const projectsCmd = (): Node[] => {
  const nodes: Node[] = [...heading('projects')];
  projects.forEach((p, i) => {
    if (i > 0) nodes.push({ kind: 'blank' });
    nodes.push({ kind: 'meta', left: p.name, right: p.period });
    if (p.url) nodes.push({ kind: 'kv', key: 'url', value: p.url, href: p.url });
    nodes.push({ kind: 'blank' });
    p.blocks.forEach((b) => nodes.push({ kind: 'tagged', tag: b.tag, body: b.body }));
  });
  return nodes;
};

const skills = (): Node[] => {
  const nodes: Node[] = [...heading('skills')];
  skillGroups.forEach((group, i) => {
    if (i > 0) nodes.push({ kind: 'blank' });
    nodes.push({ kind: 'text', text: group.category.toUpperCase(), tone: 'accent' });
    group.skills.forEach((s) => nodes.push({ kind: 'bar', label: s.name, level: s.level }));
  });
  return nodes;
};

const statsCmd = (): Node[] => [
  ...heading('stats'),
  ...stats.map((s): Node => ({ kind: 'stat', value: s.value, label: s.label })),
];

const educationCmd = (): Node[] => {
  const nodes: Node[] = [...heading('education')];
  education.forEach((e, i) => {
    if (i > 0) nodes.push({ kind: 'blank' });
    nodes.push({ kind: 'meta', left: e.degree, right: e.period });
    nodes.push({ kind: 'text', text: e.institution, tone: 'dim' });
  });
  return nodes;
};

const contactCmd = (): Node[] => [
  ...heading('contact'),
  ...contact.map((c): Node => ({ kind: 'kv', key: c.label, value: c.value, href: c.href })),
  { kind: 'blank' },
  { kind: 'text', text: profile.available, tone: 'dim' },
];

// The registry is the single source of truth for this listing — including
// /help itself, so its description never drifts out of sync.
const help = (): Node[] => [
  ...heading('help'),
  ...registry.map((c): Node => ({ kind: 'cmd', name: c.name, desc: c.desc })),
  { kind: 'blank' },
  { kind: 'text', text: 'Tab completes · ↑ ↓ cycles history · /clear resets', tone: 'dim' },
];

export const registry: Command[] = [
  { name: '/about', desc: 'bio, role, stack, location', quick: true, run: about },
  { name: '/experience', desc: 'roles and what I shipped', quick: true, run: experienceCmd },
  { name: '/projects', desc: 'selected side work', quick: true, run: projectsCmd },
  { name: '/skills', desc: 'stack by category with proficiency', quick: true, run: skills },
  { name: '/stats', desc: 'the numbers behind the work', quick: true, run: statsCmd },
  { name: '/education', desc: 'degrees', run: educationCmd },
  { name: '/contact', desc: 'all contact details', quick: true, run: contactCmd },
  { name: '/help', desc: 'this command menu', quick: true, run: help },
  { name: '/clear', desc: 'wipe the terminal back to the boot screen', quick: true, run: () => [] },
];

export const commandNames = registry.map((c) => c.name);

export function findCommand(raw: string): Command | undefined {
  const name = raw.trim().toLowerCase();
  return registry.find((c) => c.name === name);
}

/** Longest command that starts with `raw`, for the inline ghost completion. */
export function completionFor(raw: string): string | null {
  const value = raw.trim().toLowerCase();
  if (!value.startsWith('/') || value.length < 2) return null;
  const match = commandNames.find((n) => n.startsWith(value) && n !== value);
  return match ?? null;
}

export function unknownCommand(raw: string): Node[] {
  return [
    { kind: 'text', text: `command not found: ${raw}`, tone: 'accent' },
    { kind: 'text', text: "type /help to see everything this terminal knows.", tone: 'dim' },
  ];
}

export const bootLines: Node[] = [
  { kind: 'text', text: `${profile.name} — ${profile.role}`, tone: 'accent' },
  { kind: 'text', text: profile.stack, tone: 'dim' },
  { kind: 'blank' },
  { kind: 'text', text: 'Interactive résumé. Type a command to begin.' },
  { kind: 'text', text: 'Start with /about, or /help for the full menu.', tone: 'dim' },
];
