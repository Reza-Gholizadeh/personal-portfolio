export type Tone = 'default' | 'dim' | 'accent';

/**
 * A single renderable row of terminal output.
 *
 * Named `OutputLine` rather than `Node` so it never shadows the DOM `Node`
 * global — inside a `.tsx` file that collision is genuinely confusing.
 */
export type OutputLine =
  | { kind: 'text'; text: string; tone?: Tone }
  | { kind: 'blank' }
  | { kind: 'rule' }
  | { kind: 'heading'; text: string }
  | { kind: 'meta'; left: string; right: string }
  | { kind: 'kv'; key: string; value: string; href?: string | null }
  | { kind: 'tagged'; tag: string; body: string }
  | { kind: 'tags'; label: string; items: readonly string[] }
  | { kind: 'cmd'; name: string; desc: string }
  | { kind: 'quote'; text: string }
  | { kind: 'pre'; text: string }
  /** A labelled box drawn with CSS rather than box-drawing characters, which
      would wrap badly on narrow screens. */
  | { kind: 'panel'; label: string; lines: OutputLine[] }
  | {
      kind: 'postEntry';
      ordinal: string;
      date: string;
      readingTime: string;
      command: string;
      title: string;
      tags: readonly string[];
    };

/** One committed entry in the scrollback: the echoed input plus its output. */
export type Entry = {
  id: number;
  input: string | null;
  lines: OutputLine[];
};

import type { Environment } from './environment';

/**
 * Everything a command may need beyond the résumé data it imports directly.
 * Passed as one object so adding a capability later does not reshuffle
 * positional parameters across every command.
 */
export type CommandContext = {
  /** Captured when the command was submitted, so no command touches `window`. */
  env: Environment;
  /** Whitespace-separated words after the command name: `/blog 1` -> ['1']. */
  args: string[];
};

export type Command = {
  name: string;
  desc: string;
  /** Shown in the footer quick-launch bar. */
  quick?: boolean;
  /**
   * Wipes the scrollback instead of appending to it. Declared here so the
   * Terminal component never has to special-case a command by name.
   */
  resets?: boolean;
  /**
   * Returns a post slug to leave the terminal for the reading view, or null to
   * stay. Declared like `resets` so navigation is a property of the command
   * rather than a name the reducer has to recognise.
   */
  opens?: (context: CommandContext) => string | null;
  /** Values accepted as the first argument, offered by Tab completion. */
  completions?: () => readonly string[];
  run: (context: CommandContext) => OutputLine[];
};

/**
 * The terminal's complete state. Held outside React by `sessionReducer`, so the
 * rules can be exercised without mounting a component.
 */
export type SessionState = {
  entries: Entry[];
  input: string;
  caret: number;
  history: string[];
  /** Index into `history` while recalling; null when typing fresh input. */
  historyCursor: number | null;
  /** Bumped by /clear to replay the boot banner. */
  bootRun: number;
  /** Slug of the post being read full-screen; null while in the terminal. */
  openPost: string | null;
  /**
   * Bumped whenever the reducer replaces the input text itself (Tab completion,
   * history recall). The view watches this to move the real DOM caret, which it
   * must not do on every keystroke or it would collapse manual selections.
   */
  injections: number;
  nextEntryId: number;
};

export type SessionAction =
  | { type: 'inputChanged'; input: string; caret: number }
  | { type: 'caretMoved'; caret: number }
  | { type: 'completionAccepted'; completion: string }
  | { type: 'submitted'; env: Environment }
  | { type: 'historyPrevious' }
  | { type: 'historyNext' }
  | { type: 'postClosed' };
