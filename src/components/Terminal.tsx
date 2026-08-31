import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Output from './Output';
import {
  bootLines,
  completionFor,
  findCommand,
  registry,
  unknownCommand,
} from '../terminal/commands';
import type { Entry } from '../terminal/types';
import { profile } from '../data/resume';

const CURSOR_INTERVAL = 530;
const BOOT_STAGGER = 90;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/** Reveals the boot banner one line at a time. Returns how many lines are visible. */
function useBootReveal(total: number, instant: boolean, resetKey: number) {
  const [visible, setVisible] = useState(instant ? total : 0);

  useEffect(() => {
    if (instant) {
      setVisible(total);
      return;
    }
    setVisible(0);
    let line = 0;
    const id = window.setInterval(() => {
      line += 1;
      setVisible(line);
      if (line >= total) window.clearInterval(id);
    }, BOOT_STAGGER);
    return () => window.clearInterval(id);
  }, [total, instant, resetKey]);

  return visible;
}

const PROMPT = `${profile.handle}@${profile.host}`;

export default function Terminal() {
  const reducedMotion = usePrefersReducedMotion();

  const [entries, setEntries] = useState<Entry[]>([]);
  const [value, setValue] = useState('');
  const [caret, setCaret] = useState(0);
  const [focused, setFocused] = useState(true);
  const [bootKey, setBootKey] = useState(0);
  const [cursorOn, setCursorOn] = useState(true);

  const history = useRef<string[]>([]);
  const historyIndex = useRef<number | null>(null);
  const nextId = useRef(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastEntryRef = useRef<HTMLElement | null>(null);

  const visibleBootLines = useBootReveal(bootLines.length, reducedMotion, bootKey);
  const ghost = useMemo(() => completionFor(value), [value]);

  // Blinking block cursor, on a fixed 530ms beat like a real terminal.
  useEffect(() => {
    if (reducedMotion) {
      setCursorOn(true);
      return;
    }
    const id = window.setInterval(() => setCursorOn((on) => !on), CURSOR_INTERVAL);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  // Restart the blink from "on" whenever the user types, so the caret never
  // disappears mid-keystroke.
  useEffect(() => {
    setCursorOn(true);
  }, [value, caret]);

  // Park the newest entry at the top of the screen so long output is read from
  // its start, rather than dumping the user at the tail of it. Scrolls the
  // screen element directly — scrollIntoView would move the page behind it too.
  useLayoutEffect(() => {
    const screen = scrollRef.current;
    if (!screen) return;
    const behavior = reducedMotion ? 'auto' : 'smooth';
    const entry = lastEntryRef.current;
    screen.scrollTo({ top: entry ? Math.max(0, entry.offsetTop - 16) : 0, behavior });
  }, [entries, reducedMotion]);

  const focusInput = useCallback(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    focusInput();
  }, [focusInput]);

  const syncCaret = useCallback(() => {
    const el = inputRef.current;
    if (el) setCaret(el.selectionStart ?? el.value.length);
  }, []);

  const submit = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      setValue('');
      setCaret(0);
      historyIndex.current = null;

      if (!trimmed) {
        setEntries((prev) => [...prev, { id: nextId.current++, input: '', nodes: [] }]);
        return;
      }

      history.current = [...history.current, trimmed];

      const command = findCommand(trimmed);
      if (command?.name === '/clear') {
        setEntries([]);
        setBootKey((k) => k + 1);
        return;
      }

      const nodes = command ? command.run() : unknownCommand(trimmed);
      setEntries((prev) => [...prev, { id: nextId.current++, input: trimmed, nodes }]);
    },
    [],
  );

  const runQuick = useCallback(
    (name: string) => {
      submit(name);
      focusInput();
    },
    [submit, focusInput],
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      submit(value);
      return;
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      if (ghost) {
        setValue(ghost);
        requestAnimationFrame(() => {
          inputRef.current?.setSelectionRange(ghost.length, ghost.length);
          setCaret(ghost.length);
        });
      }
      return;
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const list = history.current;
      if (list.length === 0) return;
      event.preventDefault();

      let index = historyIndex.current;
      if (event.key === 'ArrowUp') {
        index = index === null ? list.length - 1 : Math.max(0, index - 1);
      } else {
        if (index === null) return;
        index = index + 1;
        if (index >= list.length) {
          historyIndex.current = null;
          setValue('');
          setCaret(0);
          return;
        }
      }

      historyIndex.current = index;
      const next = list[index];
      setValue(next);
      requestAnimationFrame(() => {
        inputRef.current?.setSelectionRange(next.length, next.length);
        setCaret(next.length);
      });
      return;
    }

    if (event.key === 'l' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      submit('/clear');
    }
  };

  // Click anywhere to refocus — but never steal a text selection or a link click.
  const onSurfaceMouseUp = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest('a, button')) return;
    if (window.getSelection()?.toString()) return;
    focusInput();
  };

  const before = value.slice(0, caret);
  const atCaret = value.slice(caret, caret + 1);
  const after = value.slice(caret + 1);
  const ghostTail = ghost ? ghost.slice(value.trim().length) : '';

  return (
    <div className="terminal" onMouseUp={onSurfaceMouseUp}>
      <header className="titlebar">
        <div className="titlebar__lights" aria-hidden="true">
          <span /> <span /> <span />
        </div>
        <div className="titlebar__title">
          {PROMPT} — {profile.role.toLowerCase()}
        </div>
        <div className="titlebar__status">
          <span className="status__dot" aria-hidden="true" />
          available
        </div>
      </header>

      <div className="screen" ref={scrollRef}>
        <div className="screen__inner">
          <section className="boot" aria-label="Introduction">
            {bootLines.slice(0, visibleBootLines).map((node, i) => (
              <Output key={i} nodes={[node]} />
            ))}
          </section>

          {entries.map((entry, i) => (
            <section
              className="entry"
              key={entry.id}
              ref={i === entries.length - 1 ? lastEntryRef : null}
            >
              {entry.input !== null && (
                <div className="row row--echo">
                  <span className="prompt">
                    <span className="prompt__user">{PROMPT}</span>
                    <span className="prompt__path">~</span>
                    <span className="prompt__sigil">$</span>
                  </span>
                  <span className="echo__text">{entry.input}</span>
                </div>
              )}
              <Output nodes={entry.nodes} />
            </section>
          ))}

          <div className={`row row--input ${focused ? 'is-focused' : ''}`}>
            <label className="prompt" htmlFor="terminal-input">
              <span className="prompt__user">{PROMPT}</span>
              <span className="prompt__path">~</span>
              <span className="prompt__sigil">$</span>
            </label>

            <span className="inputline">
              <span className="inputline__text">
                {before}
                <span className={`caret ${cursorOn && focused ? 'is-on' : ''}`}>
                  {atCaret || ' '}
                </span>
                {after}
                {ghostTail && <span className="inputline__ghost">{ghostTail}</span>}
              </span>

              <input
                id="terminal-input"
                ref={inputRef}
                className="inputline__field"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  syncCaret();
                }}
                onKeyDown={onKeyDown}
                onKeyUp={syncCaret}
                onClick={syncCaret}
                onSelect={syncCaret}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
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
              press <kbd>Tab</kbd> to complete <span className="hint__cmd">{ghost}</span>
            </p>
          )}
        </div>
      </div>

      <footer className="launcher" aria-label="Quick commands">
        <span className="launcher__label">run</span>
        <div className="launcher__buttons">
          {registry
            .filter((c) => c.quick)
            .map((c) => (
              <button key={c.name} type="button" onClick={() => runQuick(c.name)}>
                {c.name}
              </button>
            ))}
        </div>
      </footer>
    </div>
  );
}
