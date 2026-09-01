import type { OutputLine } from '../terminal/types';

/**
 * Posts are authored as typed lines rather than markdown strings: every other
 * piece of content in this app is already structured data, and it keeps a
 * parser (and its escaping rules) out of the bundle. If posting gets frequent,
 * the upgrade path is converting markdown to these lines at build time.
 */
export type Post = {
  slug: string;
  title: string;
  date: string;
  tags: readonly string[];
  body: OutputLine[];
};

const WORDS_PER_MINUTE = 200;

/**
 * Derived from the body rather than stored, so it can never drift out of date
 * when a post is edited.
 */
export function readingTime(post: Post): string {
  const words = post.body
    .map((line) => ('text' in line ? line.text : ''))
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return `${Math.max(1, Math.round(words / WORDS_PER_MINUTE))} min read`;
}

const CI_FLOW = `Git diff
   ↓
Changed files
   ↓
Owning projects
   ↓
Dependency graph
   ↓
Affected projects
   ↓
Run validation`;

export const posts: Post[] = [
  {
    slug: 'monorepo-ci-pipeline',
    title: 'How We Cut Our Monorepo CI Pipeline from 12 Minutes to 2 Minutes',
    date: '2026-09-01',
    tags: ['CI', 'Turborepo', 'Monorepo'],
    body: [
      {
        kind: 'text',
        text: 'Our frontend lives in a monorepo built with pnpm workspaces and Turborepo, with multiple applications and a growing number of shared packages.',
      },
      { kind: 'text', text: 'For a while, our CI setup kept up fine. Then it did not.' },
      {
        kind: 'text',
        text: 'The problem was not that our validation steps were particularly slow. The problem was that CI did not really understand the scope of a change.',
      },
      {
        kind: 'text',
        text: 'A one-line fix in a single application could still trigger validation across a large part of the repository. Whether you changed one file or refactored a shared package, the pipeline could end up doing almost the same amount of work.',
      },
      { kind: 'text', text: 'Our typical pipeline had reached around 12 minutes.' },
      {
        kind: 'text',
        text: 'For a large change, that is not necessarily a problem. For a one-line fix, it felt unnecessary.',
      },

      { kind: 'blank' },
      { kind: 'heading', text: 'The first approach was the obvious one' },
      {
        kind: 'text',
        text: 'We initially looked at making the existing pipeline faster: better caching, faster installs, optimising some of the validation steps.',
      },
      { kind: 'text', text: 'Those changes helped, but only to a point.' },
      { kind: 'text', text: 'Eventually, we realised we were asking the wrong question.' },
      { kind: 'text', text: 'Instead of:', tone: 'dim' },
      { kind: 'quote', text: 'How can we make the pipeline faster?' },
      { kind: 'text', text: 'we started asking:', tone: 'dim' },
      { kind: 'quote', text: 'Why are we running all of this in the first place?' },
      { kind: 'text', text: 'That changed the direction of the work.' },

      { kind: 'blank' },
      { kind: 'heading', text: 'Making validation affected-aware' },
      {
        kind: 'text',
        text: 'Turborepo already knows how the projects in our workspace depend on each other. We wanted to use that information to determine which projects could actually be affected by a change.',
      },
      { kind: 'text', text: 'The flow was roughly:', tone: 'dim' },
      { kind: 'pre', text: CI_FLOW },
      { kind: 'text', text: 'The important distinction here is changed vs. affected.', tone: 'accent' },
      {
        kind: 'text',
        text: 'If we change something inside menu, we do not necessarily need to validate unrelated applications.',
      },
      {
        kind: 'text',
        text: 'But if menu depends on a shared package and that package changes, menu becomes affected even though none of its own files changed.',
      },
      {
        kind: 'text',
        text: 'That distinction is what allowed us to stop treating every PR as a repository-wide validation job.',
      },

      { kind: 'blank' },
      { kind: 'heading', text: 'The hard part was not finding affected projects' },
      { kind: 'text', text: 'The graph itself was not the difficult part.' },
      {
        kind: 'text',
        text: 'The difficult part was trusting the result enough to actually skip validation.',
      },
      {
        kind: 'text',
        text: 'Skipping validation is a bet. If the affected calculation is wrong, we might miss a regression instead of simply running an unnecessary job.',
      },
      { kind: 'text', text: 'So we had to be conservative.' },
      {
        kind: 'text',
        text: 'Changes to things like shared configuration, lockfiles, build configuration, or CI workflows can have a much wider impact than a change isolated to one application. For these cases, we deliberately fall back to a broader validation scope.',
      },
      { kind: 'text', text: 'The goal was not to minimise the number of things we run. It was to:' },
      { kind: 'quote', text: 'Run the smallest set of validation we can defend.' },
      { kind: 'text', text: 'That became an important principle for the implementation.' },

      { kind: 'blank' },
      { kind: 'heading', text: 'The result' },
      {
        kind: 'text',
        text: 'After introducing affected-aware validation, our typical pipeline went from around 12 minutes to 2 minutes — roughly an 83% reduction in pipeline time.',
        tone: 'accent',
      },
      {
        kind: 'text',
        text: 'And we did not achieve that by making individual tests or builds dramatically faster. We simply stopped running work that was not necessary for most changes.',
      },
      {
        kind: 'text',
        text: 'For a small change, the pipeline now works with a much smaller part of the dependency graph instead of treating the entire repository as the unit of validation.',
      },

      { kind: 'blank' },
      { kind: 'heading', text: 'What I took away' },
      {
        kind: 'text',
        text: 'The biggest lesson for me was not really about Turborepo or graph traversal.',
      },
      {
        kind: 'text',
        text: 'It is that we spent a while trying to make unnecessary work faster before asking whether we needed to do that work at all. Those are two very different questions.',
      },
      {
        kind: 'text',
        text: 'A monorepo does not have to mean a monolithic CI pipeline. Once you have a dependency graph, you can use it to make the feedback loop proportional to the scope of the change.',
      },
      {
        kind: 'text',
        text: 'It also opened the door to applying the same idea beyond validation — selective builds, targeted tests, and eventually even deployment decisions.',
      },
      { kind: 'text', text: 'But that is a problem for another day.', tone: 'dim' },
    ],
  },
];
