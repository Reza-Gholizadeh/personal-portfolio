# Reza Gholizadeh — Portfolio

Interactive terminal résumé. React + TypeScript + Vite, no UI dependencies.

## Run

```bash
npm install
npm run dev
```

`npm run build` emits a static bundle to `dist/`, deployable as-is to Vercel,
Netlify, GitHub Pages or any static host. Deployment to GitHub Pages runs from
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on every push to
`main`.

| Script                 | Purpose                           |
| ---------------------- | --------------------------------- |
| `npm run dev`          | Vite dev server                   |
| `npm run build`        | typecheck, then production bundle |
| `npm run typecheck`    | `tsc -b --noEmit`                 |
| `npm run lint`         | ESLint (flat config)              |
| `npm run format`       | Prettier write                    |
| `npm run format:check` | Prettier check, for CI            |

## Commands

| Command       | Output                                                 |
| ------------- | ------------------------------------------------------ |
| `/about`      | bio, role, stack, location                             |
| `/experience` | roles, with tagged responsibility blocks               |
| `/projects`   | selected side work                                     |
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
