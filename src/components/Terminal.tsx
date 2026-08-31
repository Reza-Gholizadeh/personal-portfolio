import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Output from './Output';
import Prompt, { PROMPT_LABEL } from './Prompt';
import { useCommandHistory } from '../hooks/useCommandHistory';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { bootLines, completionFor, findCommand, quickCommands, unknownCommand } from '../terminal/commands';
import type { Entry } from '../terminal/types';
import { profile } from '../data/resume';

const INPUT_ID = 'terminal-input';

/** Breathing room above the entry parked at the top of the screen. */
const SCROLL_OFFSET_PX = 16;

export default function Terminal() {
  const reducedMotion = usePrefersReducedMotion();
  const history = useCommandHistory();

  const [entries, setEntries] = useState<Entry[]>([]);
  const [value, setValue] = useState('');
  const [caret, setCaret] = useState(0);
  const [isFocused, setIsFocused] = useState(true);
  const [bootKey, setBootKey] = useState(0);

  const nextEntryId = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const lastEntryRef = useRef<HTMLElement | null>(null);

  const completion = useMemo(() => completionFor(value), [value]);

  // Park the newest entry at the top of the screen so long output is read from
  // its start, rather than dumping the reader at the tail of it. Scrolls the
  // screen element directly — scrollIntoView would move the page behind it too.
  useLayoutEffect(() => {
    const screen = screenRef.current;
    if (!screen) return;
    const entry = lastEntryRef.current;
    screen.scrollTo({
      top: entry ? Math.max(0, entry.offsetTop - SCROLL_OFFSET_PX) : 0,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  }, [entries, reducedMotion]);

  const focusInput = useCallback(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(focusInput, [focusInput]);

  const syncCaret = useCallback(() => {
    const input = inputRef.current;
    if (input) setCaret(input.selectionStart ?? input.value.length);
  }, []);

  /** Replaces the input and drops the caret at the end of the new text. */
  const replaceInput = useCallback((next: string) => {
    setValue(next);
    setCaret(next.length);
    requestAnimationFrame(() => inputRef.current?.setSelectionRange(next.length, next.length));
  }, []);

  const appendEntry = useCallback((entry: Omit<Entry, 'id'>) => {
    setEntries((previous) => [...previous, { ...entry, id: nextEntryId.current++ }]);
  }, []);

  const submit = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      setValue('');
      setCaret(0);
      history.reset();

      if (!trimmed) {
        appendEntry({ input: '', lines: [] });
        return;
      }

      history.push(trimmed);

      const command = findCommand(trimmed);
      if (command?.resets) {
        setEntries([]);
        setBootKey((key) => key + 1);
        return;
      }

      appendEntry({ input: trimmed, lines: command ? command.run() : unknownCommand(trimmed) });
    },
    [appendEntry, history],
  );

  const applyRecall = useCallback(
    (recall: ReturnType<typeof history.recallPrevious>) => {
      if (recall.kind === 'none') return;
      replaceInput(recall.kind === 'cleared' ? '' : recall.value);
    },
    [history, replaceInput],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        submit(value);
        return;

      case 'Tab':
        event.preventDefault();
        if (completion) replaceInput(completion);
        return;

      case 'ArrowUp':
        event.preventDefault();
        applyRecall(history.recallPrevious());
        return;

      case 'ArrowDown':
        event.preventDefault();
        applyRecall(history.recallNext());
        return;

      // Ctrl/Cmd-L clears, as it does in a real shell.
      case 'l':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          submit('/clear');
        }
    }
  };

  // Click anywhere to refocus — but never steal a text selection or a link click.
  const handleSurfaceMouseUp = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest('a, button')) return;
    if (window.getSelection()?.toString()) return;
    focusInput();
  };

  const textBeforeCaret = value.slice(0, caret);
  const characterAtCaret = value.slice(caret, caret + 1);
  const textAfterCaret = value.slice(caret + 1);
  // Always index-aligned with `value`: completionFor only returns a match that
  // the raw input is a true prefix of.
  const ghostTail = completion?.slice(value.length) ?? '';

  return (
    <div className="terminal" onMouseUp={handleSurfaceMouseUp}>
      <header className="titlebar">
        <div className="titlebar__lights" aria-hidden="true">
          <span /> <span /> <span />
        </div>
        <div className="titlebar__title">
          {PROMPT_LABEL} — {profile.role.toLowerCase()}
        </div>
        <div className="titlebar__status">
          <span className="status__dot" aria-hidden="true" />
          available
        </div>
      </header>

      <div className="screen" ref={screenRef}>
        <div className="screen__inner">
          {/* Keyed on bootKey so /clear replays the staggered reveal. */}
          <section className="boot" aria-label="Introduction" key={bootKey}>
            <Output lines={bootLines} />
          </section>

          {entries.map((entry, index) => (
            <section
              className="entry"
              key={entry.id}
              ref={index === entries.length - 1 ? lastEntryRef : null}
            >
              {entry.input !== null && (
                <div className="row row--echo">
                  <Prompt />
                  <span className="echo__text">{entry.input}</span>
                </div>
              )}
              <Output lines={entry.lines} />
            </section>
          ))}

          <div className={`row row--input ${isFocused ? 'is-focused' : ''}`}>
            <Prompt htmlFor={INPUT_ID} />

            <span className="inputline">
              <span className="inputline__text">
                {textBeforeCaret}
                {/* Remounting on every edit restarts the CSS blink, so the
                    caret is always solid at the moment you type. */}
                <span key={`${value}:${caret}`} className={`caret ${isFocused ? 'is-blinking' : ''}`}>
                  {characterAtCaret || ' '}
                </span>
                {textAfterCaret}
                {ghostTail && <span className="inputline__ghost">{ghostTail}</span>}
              </span>

              <input
                id={INPUT_ID}
                ref={inputRef}
                className="inputline__field"
                value={value}
                onChange={(event) => {
                  setValue(event.target.value);
                  syncCaret();
                }}
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

          {ghostTail && (
            <p className="hint" aria-live="polite">
              press <kbd>Tab</kbd> to complete <span className="hint__cmd">{completion}</span>
            </p>
          )}
        </div>
      </div>

      <footer className="launcher" aria-label="Quick commands">
        <span className="launcher__label">run</span>
        <div className="launcher__buttons">
          {quickCommands.map((command) => (
            <button
              key={command.name}
              type="button"
              onClick={() => {
                submit(command.name);
                focusInput();
              }}
            >
              {command.name}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}
