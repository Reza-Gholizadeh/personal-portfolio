export type Tone = 'default' | 'dim' | 'accent';

/** A single renderable row of terminal output. */
export type Node =
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
  nodes: Node[];
};
