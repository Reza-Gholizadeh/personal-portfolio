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
