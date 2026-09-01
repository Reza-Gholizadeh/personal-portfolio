import { useCallback, useMemo, useReducer } from 'react';
import { completionFor } from '../terminal/commands';
import { readEnvironment } from '../terminal/environment';
import { initialSession, sessionReducer } from '../terminal/session';
import type { SessionAction } from '../terminal/types';

/**
 * Binds the pure session reducer to React and derives everything the view needs.
 *
 * The component layer sees only this view model — never the reducer's internals
 * such as `historyCursor` or `nextEntryId`.
 */
export function useTerminalSession() {
  const [state, dispatch] = useReducer(sessionReducer, initialSession);

  const completion = useMemo(() => completionFor(state.input), [state.input]);

  // Both submission paths capture the environment snapshot here, at the edge of
  // the pure reducer, so no command has to reach for `window` itself.
  const submit = useCallback(() => {
    dispatch({ type: 'submitted', env: readEnvironment() });
  }, []);

  const run = useCallback(
    (input: string) => {
      dispatch({ type: 'inputChanged', input, caret: input.length });
      submit();
    },
    [submit],
  );

  return useMemo(
    () => ({
      entries: state.entries,
      input: state.input,
      caret: state.caret,
      bootRun: state.bootRun,
      injections: state.injections,
      completion,
      /**
       * The not-yet-typed remainder of the suggested command. Always
       * index-aligned with `input`, because completionFor only matches when the
       * raw input is a true prefix.
       */
      ghost: completion?.slice(state.input.length) ?? '',
      dispatch: dispatch as React.Dispatch<SessionAction>,
      submit,
      run,
    }),
    [state.entries, state.input, state.caret, state.bootRun, state.injections, completion, submit, run],
  );
}
