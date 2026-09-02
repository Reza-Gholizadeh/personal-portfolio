import { useCallback, useEffect, useRef } from 'react';
import Article from './Article';
import InputLine, { type InputLineHandle } from './InputLine';
import Launcher from './Launcher';
import Scrollback from './Scrollback';
import TitleBar from './TitleBar';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { posts } from '../data/blog';
import { useScrollToLatest } from '../hooks/useScrollToLatest';
import { useTerminalSession } from '../hooks/useTerminalSession';

/**
 * Composition only. All terminal behaviour lives in `sessionReducer`; this
 * component wires the view model to the presentational pieces and owns the two
 * concerns that are genuinely about the DOM — scrolling and focus.
 */
export default function Terminal() {
  const session = useTerminalSession();
  const reducedMotion = usePrefersReducedMotion();

  const inputRef = useRef<HTMLInputElement>(null);
  const inputHandleRef = useRef<InputLineHandle>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const lastEntryRef = useRef<HTMLElement>(null);

  useScrollToLatest(screenRef, lastEntryRef, session.entries, !reducedMotion);

  const focusInput = useCallback(() => inputHandleRef.current?.focus(), []);
  // Keyed on openPost, not mount: this component stays mounted while an article
  // is open and only swaps its subtree, so InputLine remounts underneath it and
  // would otherwise come back unfocused.
  useEffect(() => {
    if (!session.openPost) focusInput();
  }, [session.openPost, focusInput]);

  const runCommand = useCallback(
    (command: string) => {
      session.run(command);
      focusInput();
    },
    [session, focusInput],
  );

  // Click anywhere to refocus — but never steal a text selection or a link click.
  const handleMouseUp = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest('a, button')) return;
    if (window.getSelection()?.toString()) return;
    focusInput();
  };

  // Reading a post replaces the terminal entirely rather than rendering beside
  // it, so the article gets the whole viewport and its own typography.
  const openPost = posts.find((post) => post.slug === session.openPost);
  if (openPost) {
    return <Article post={openPost} onClose={() => session.dispatch({ type: 'postClosed' })} />;
  }

  return (
    <div className="terminal" onMouseUp={handleMouseUp}>
      <TitleBar />

      <div className="screen" ref={screenRef}>
        <div className="screen__inner">
          <Scrollback
            entries={session.entries}
            bootRun={session.bootRun}
            lastEntryRef={lastEntryRef}
            onCommand={runCommand}
          />

          <InputLine
            value={session.input}
            caret={session.caret}
            ghost={session.ghost}
            injections={session.injections}
            completion={session.completion}
            dispatch={session.dispatch}
            onSubmit={session.submit}
            onRun={session.run}
            inputRef={inputRef}
            handleRef={inputHandleRef}
          />

          {session.ghost && (
            <p className="hint" aria-live="polite">
              press <kbd>Tab</kbd> to complete <span className="hint__cmd">{session.completion}</span>
            </p>
          )}
        </div>
      </div>

      <Launcher onRun={runCommand} />
    </div>
  );
}
