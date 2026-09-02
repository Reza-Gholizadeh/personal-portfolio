# Reza Gholizadeh — Portfolio

Interactive terminal résumé. React + TypeScript + Vite, no UI dependencies.
`/blog` hands off to a separate Astro project ([`blog/`](blog)) that renders
each post as a real, crawlable static page — see
[Blog](#blog) below.

## Run

```bash
npm install
npm run dev
```

`npm run build` emits a static bundle to `dist/`, deployable as-is to Vercel,
Netlify, GitHub Pages or any static host. Deployment to GitHub Pages runs from
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on every push to
`main`, and also builds and merges the Astro blog in (see [Blog](#blog)).

| Script                 | Purpose                                        |
| ---------------------- | ---------------------------------------------- |
| `npm run dev`          | Vite dev server                                |
| `npm run build`        | typecheck, then production bundle              |
| `npm run typecheck`    | `tsc -b --noEmit`                              |
| `npm run lint`         | ESLint (flat config)                           |
| `npm run format`       | Prettier write                                 |
| `npm run format:check` | Prettier check, for CI                         |
| `npm run build:all`    | this app + the Astro blog, merged into `dist/` |
| `npm run preview:all`  | `build:all`, then serve it locally             |
| `npm run blog:dev`     | Astro dev server for the blog, on its own      |

## Commands

| Command       | Output                                                 |
| ------------- | ------------------------------------------------------ |
| `/about`      | bio, role, stack, location                             |
| `/experience` | roles, with tagged responsibility blocks               |
| `/projects`   | selected side work                                     |
| `/blog`       | writing — `/blog` to list, `/blog <slug>` to read      |
| `/skills`     | stack by category                                      |
| `/education`  | degrees                                                |
| `/env`        | what this page detected about your browser             |
| `/contact`    | email, LinkedIn, location                              |
| `/help`       | command menu                                           |
| `/clear`      | wipe back to the boot screen (also `Ctrl`/`Cmd` + `L`) |

Interactions: `Tab` accepts the inline ghost completion, `↑`/`↓` cycle command
history, the footer buttons run commands without typing, and clicking anywhere
refocuses the input.

## Structure

```
src/
  terminal/     session.ts   — the whole state machine, pure, no React
                commands.ts  — command registry + lookup/completion
                types.ts     — OutputLine, Entry, Command, SessionState
  hooks/        useTerminalSession — binds the reducer to React
                useScrollToLatest, usePrefersReducedMotion — DOM concerns
  components/   Terminal (composition) → TitleBar, Scrollback, InputLine,
                Launcher, Output, Prompt
  data/         résumé content
```

State is separated from logic. Every rule about what the terminal _does_ —
history recall, completion, clearing, entry ids — lives in `sessionReducer`, a
pure `(state, action) => state` function with no React or DOM imports. The
components decide only how that state looks, and hold exactly one piece of
state of their own: whether the input is focused, which is presentation.

Tab completion covers arguments as well as command names: a command declares
its accepted values with `completions`, so `/blog mo` completes a post slug
without hardcoding the blog anywhere in the input handling.

A command can hand the reader off to a real page instead of staying in the
terminal — declared with `opens`, the same way `/clear` declares `resets`, so
the reducer never recognises a command by name. `/blog <slug>` is the one
command that does this: `opens` resolves to the post's URL on the Astro blog
project, and a `useEffect` in `Terminal.tsx` — the one place allowed to touch
`window` — performs the actual navigation. `src/data/blog.ts` holds only the
metadata the terminal's `/blog` listing needs (title, date, tags, reading
time); the prose lives in `blog/src/content/posts/*.md` and is hand-kept in
sync (see [Blog](#blog)).

Reading the browser for `/env` is a side effect, so it happens once at the
edge — `readEnvironment()` is called when a command is submitted and the
snapshot travels into the reducer on the action. `sessionReducer` stays a pure
function of (state, action), and each `/env` in the scrollback keeps the values
it was run with.

Commands are pure functions returning `OutputLine[]`, so output is data rather
than markup, and `Output` renders it through a lookup table keyed by line kind —
a mapped type makes a missing renderer a compile error. Animation (cursor blink,
staggered boot banner) lives in CSS rather than JS timers, keeping it off the
render path and letting `prefers-reduced-motion` override it.

## Editing content

All résumé content is in [`src/data/resume.ts`](src/data/resume.ts) — profile,
contact, experience, projects, skills and education. Commands are wired
up in [`src/terminal/commands.ts`](src/terminal/commands.ts); adding one means
appending to the `registry` array.

## Blog

`/blog` used to be an in-memory view inside this SPA — no real URL, no
per-page `<title>`, nothing for a crawler to index. [`blog/`](blog) is a
separate Astro project (Content Collections + `@astrojs/sitemap`) that fixes
that: every post is a real, independently-served static page at
`/blog/<slug>/`, with its own title, meta description, canonical link,
OG/Twitter tags, JSON-LD `BlogPosting`, and an entry in the sitemap. It is a
fully independent app — its own `package.json`, deliberately not an npm
workspace — so the root project's ESLint/Prettier/`tsc` never see it (`blog`
is in `eslint.config.js`'s `ignores` and in `.prettierignore`).

CI builds both projects and copies the Astro output into `dist/blog/` before
uploading, so one GitHub Pages deploy serves both
(see [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)). Locally,
`npm run build:all` (root) does the same merge; `npm run blog:dev` runs
Astro's own dev server.

Adding a post means two small, hand-kept-in-sync edits:

1. Add `blog/src/content/posts/<slug>.md` (frontmatter: `title`, `date`,
   `tags`, `description`) — this is what Astro renders.
2. Append the matching metadata to [`src/data/blog.ts`](src/data/blog.ts)
   (`slug`, `title`, `date`, `tags`, `readingTime`) — this is what the
   terminal's `/blog` listing renders and links from.

At roughly one post a year, that's simpler than a script that regenerates one
file from the other.
