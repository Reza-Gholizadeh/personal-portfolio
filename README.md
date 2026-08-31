# Reza Gholizadeh — Portfolio

Interactive terminal résumé. React + TypeScript + Vite, no UI dependencies.

## Run

```bash
npm install
npm run dev
```

`npm run build` emits a static bundle to `dist/`, deployable as-is to Vercel,
Netlify, GitHub Pages or any static host.

## Commands

| Command | Output |
| --- | --- |
| `/about` | bio, role, stack, location |
| `/experience` | roles, with tagged responsibility blocks |
| `/projects` | selected side work |
| `/skills` | stack by category with ASCII proficiency bars |
| `/stats` | key numbers |
| `/education` | degrees |
| `/contact` | email, LinkedIn, location |
| `/help` | command menu |
| `/clear` | wipe back to the boot screen (also `Ctrl`/`Cmd` + `L`) |

Interactions: `Tab` accepts the inline ghost completion, `↑`/`↓` cycle command
history, the footer buttons run commands without typing, and clicking anywhere
refocuses the input.

## Editing content

All résumé content is in [`src/data/resume.ts`](src/data/resume.ts) — profile,
contact, stats, experience, projects, skills and education. Commands are wired
up in [`src/terminal/commands.ts`](src/terminal/commands.ts); adding one means
appending to the `registry` array. Skill `level` is 0–10 and drives the bar
width.
