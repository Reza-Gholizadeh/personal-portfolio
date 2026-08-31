import { findCommand, unknownCommand } from './commands';
import type { Entry, SessionAction, SessionState } from './types';

/**
 * The terminal's entire state machine, as a pure function of (state, action).
 *
 * Deliberately free of React and of the DOM: every rule about what the terminal
 * *is* lives here, while the components decide only how it looks. That keeps
 * the behaviour unit-testable without rendering anything, and means a component
 * never has to reason about history cursors or entry ids.
 */
export const initialSession: SessionState = {
  entries: [],
  input: '',
  caret: 0,
  history: [],
  historyCursor: null,
  bootRun: 0,
  injections: 0,
  nextEntryId: 0,
};

/** Places the caret at the end of newly injected text, as a shell does. */
const withInput = (state: SessionState, input: string): SessionState => ({
  ...state,
  input,
  caret: input.length,
  injections: state.injections + 1,
});

const append = (state: SessionState, entry: Omit<Entry, 'id'>): SessionState => ({
  ...state,
  entries: [...state.entries, { ...entry, id: state.nextEntryId }],
  nextEntryId: state.nextEntryId + 1,
});

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'inputChanged':
      return { ...state, input: action.input, caret: action.caret };

    case 'caretMoved':
      return { ...state, caret: action.caret };

    case 'completionAccepted':
      return withInput(state, action.completion);

    case 'submitted': {
      const command = state.input.trim();
      const cleared = { ...state, input: '', caret: 0, historyCursor: null };

      // A bare Enter echoes an empty prompt line, exactly like a real shell.
      if (!command) return append(cleared, { input: '', lines: [] });

      const remembered = { ...cleared, history: [...cleared.history, command] };
      const match = findCommand(command);

      if (match?.resets) {
        return { ...remembered, entries: [], bootRun: remembered.bootRun + 1 };
      }

      return append(remembered, {
        input: command,
        lines: match ? match.run() : unknownCommand(command),
      });
    }

    case 'historyPrevious': {
      if (state.history.length === 0) return state;
      const cursor =
        state.historyCursor === null ? state.history.length - 1 : Math.max(0, state.historyCursor - 1);
      return { ...withInput(state, state.history[cursor]), historyCursor: cursor };
    }

    case 'historyNext': {
      if (state.historyCursor === null) return state;
      const cursor = state.historyCursor + 1;
      // Walking past the newest entry empties the input rather than sticking.
      if (cursor >= state.history.length) {
        return { ...withInput(state, ''), historyCursor: null };
      }
      return { ...withInput(state, state.history[cursor]), historyCursor: cursor };
    }
  }
}
