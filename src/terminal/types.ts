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
  | { kind: 'bar'; label: string; level: number }
  | { kind: 'stat'; value: string; label: string }
  | { kind: 'cmd'; name: string; desc: string };

/** One committed entry in the scrollback: the echoed input plus its output. */
export type Entry = {
  id: number;
  input: string | null;
  lines: OutputLine[];
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
  run: () => OutputLine[];
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
  | { type: 'submitted' }
  | { type: 'historyPrevious' }
  | { type: 'historyNext' };
