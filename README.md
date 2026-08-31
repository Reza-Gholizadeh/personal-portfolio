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
| `/skills`     | stack by category with ASCII proficiency bars          |
| `/stats`      | key numbers                                            |
| `/education`  | degrees                                                |
| `/contact`    | email, LinkedIn, location                              |
| `/help`       | command menu                                           |
| `/clear`      | wipe back to the boot screen (also `Ctrl`/`Cmd` + `L`) |

Interactions: `Tab` accepts the inline ghost completion, `↑`/`↓` cycle command
history, the footer buttons run commands without typing, and clicking anywhere
refocuses the input.

## Structure

```
src/
  components/   Terminal (state + input), Output (line renderer), Prompt
  hooks/        useCommandHistory, usePrefersReducedMotion
  terminal/     command registry, OutputLine/Entry/Command types
  data/         résumé content
```

Commands are pure functions returning `OutputLine[]`, so output is data rather
than markup and the renderer stays a single exhaustive switch. Animation —
cursor blink and the staggered boot banner — lives in CSS rather than in JS
timers, which keeps it off the render path and free for `prefers-reduced-motion`
to override.

## Editing content

All résumé content is in [`src/data/resume.ts`](src/data/resume.ts) — profile,
contact, stats, experience, projects, skills and education. Commands are wired
up in [`src/terminal/commands.ts`](src/terminal/commands.ts); adding one means
appending to the `registry` array. Skill `level` is 0–10 and drives the bar
width.
