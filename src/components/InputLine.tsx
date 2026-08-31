import { useImperativeHandle, useLayoutEffect, useState, type Ref } from 'react';
import Prompt from './Prompt';
import type { SessionAction } from '../terminal/types';

const INPUT_ID = 'terminal-input';

export type InputLineHandle = { focus: () => void };

type InputLineProps = {
  value: string;
  caret: number;
  ghost: string;
  injections: number;
  completion: string | null;
  dispatch: React.Dispatch<SessionAction>;
  inputRef: Ref<HTMLInputElement>;
  handleRef: Ref<InputLineHandle>;
};

/**
 * The live prompt line: a transparent <input> for real keyboard and IME
 * behaviour, with the visible text painted over it so the block caret and ghost
 * completion can be styled.
 *
 * Focus is the only state kept here — it is presentation, not session history,
 * so the reducer has no reason to know about it.
 */
export default function InputLine({
  value,
  caret,
  ghost,
  injections,
  completion,
  dispatch,
  inputRef,
  handleRef,
}: InputLineProps) {
  const [isFocused, setIsFocused] = useState(true);

  useImperativeHandle(handleRef, () => ({
    focus: () => {
      const input = typeof inputRef === 'object' ? inputRef?.current : null;
      input?.focus({ preventScroll: true });
    },
  }));

  /**
   * After the reducer replaces the text (Tab completion, history recall), put
   * the real caret at the end and tell the reducer where it landed.
   *
   * Keyed on `injections` alone: syncing on every render would collapse a
   * selection as soon as the user made one. Reading the length off the DOM
   * rather than trusting `caret` makes this immune to the select/keyup events
   * that a programmatic value change fires in the same batch — those would
   * otherwise clobber the caret back to its pre-completion position.
   */
  useLayoutEffect(() => {
    const input = typeof inputRef === 'object' ? inputRef?.current : null;
    if (!input) return;
    const end = input.value.length;
    input.setSelectionRange(end, end);
    dispatch({ type: 'caretMoved', caret: end });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- must run only on injection
  }, [injections]);

  const syncCaret = (event: React.SyntheticEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    dispatch({ type: 'caretMoved', caret: input.selectionStart ?? input.value.length });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        return dispatch({ type: 'submitted' });

      case 'Tab':
        event.preventDefault();
        if (completion) dispatch({ type: 'completionAccepted', completion });
        return;

      case 'ArrowUp':
        event.preventDefault();
        return dispatch({ type: 'historyPrevious' });

      case 'ArrowDown':
        event.preventDefault();
        return dispatch({ type: 'historyNext' });

      // Ctrl/Cmd-L clears, as it does in a real shell.
      case 'l':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          dispatch({ type: 'inputChanged', input: '/clear', caret: 6 });
          dispatch({ type: 'submitted' });
        }
    }
  };

  return (
    <div className={`row row--input ${isFocused ? 'is-focused' : ''}`}>
      <Prompt htmlFor={INPUT_ID} />

      <span className="inputline">
        <span className="inputline__text">
          {value.slice(0, caret)}
          {/* Remounting on every edit restarts the CSS blink, so the caret is
              always solid at the moment you type. */}
          <span key={`${value}:${caret}`} className={`caret ${isFocused ? 'is-blinking' : ''}`}>
            {value.slice(caret, caret + 1) || ' '}
          </span>
          {value.slice(caret + 1)}
          {ghost && <span className="inputline__ghost">{ghost}</span>}
        </span>

        <input
          id={INPUT_ID}
          ref={inputRef}
          className="inputline__field"
          value={value}
          onChange={(event) =>
            dispatch({
              type: 'inputChanged',
              input: event.target.value,
              caret: event.target.selectionStart ?? event.target.value.length,
            })
          }
          onKeyDown={handleKeyDown}
          onKeyUp={syncCaret}
          onClick={syncCaret}
          onSelect={syncCaret}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Terminal command input. Type /help for available commands."
        />
      </span>
    </div>
  );
}
