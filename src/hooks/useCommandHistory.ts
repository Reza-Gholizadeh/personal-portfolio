import { useCallback, useMemo, useRef } from 'react';

/**
 * What a recall attempt produced:
 * - `value`   — put this command in the input
 * - `cleared` — walked past the newest entry; the input should go empty
 * - `none`    — nothing to recall; leave the input untouched
 */
export type Recall = { kind: 'value'; value: string } | { kind: 'cleared' } | { kind: 'none' };

const NONE: Recall = { kind: 'none' };

/**
 * Shell-style command history. The cursor sits past the newest entry until the
 * user presses ↑, matching how bash and zsh behave.
 *
 * Kept in refs rather than state: nothing here is rendered directly, and the
 * input's own value is the single source of truth for what's on screen.
 */
export function useCommandHistory() {
  const entries = useRef<string[]>([]);
  const cursor = useRef<number | null>(null);

  const push = useCallback((command: string) => {
    entries.current.push(command);
    cursor.current = null;
  }, []);

  const reset = useCallback(() => {
    cursor.current = null;
  }, []);

  const recallPrevious = useCallback((): Recall => {
    const list = entries.current;
    if (list.length === 0) return NONE;
    const next = cursor.current === null ? list.length - 1 : Math.max(0, cursor.current - 1);
    cursor.current = next;
    return { kind: 'value', value: list[next] };
  }, []);

  const recallNext = useCallback((): Recall => {
    const list = entries.current;
    if (cursor.current === null) return NONE;
    const next = cursor.current + 1;
    if (next >= list.length) {
      cursor.current = null;
      return { kind: 'cleared' };
    }
    cursor.current = next;
    return { kind: 'value', value: list[next] };
  }, []);

  // Memoised so the returned object is referentially stable, keeping every
  // consumer's dependency array honest instead of forcing them to omit it.
  return useMemo(
    () => ({ push, reset, recallPrevious, recallNext }),
    [push, reset, recallPrevious, recallNext],
  );
}
