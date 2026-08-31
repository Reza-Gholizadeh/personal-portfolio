import { type Ref } from 'react';
import Output from './Output';
import Prompt from './Prompt';
import { bootLines } from '../terminal/commands';
import type { Entry } from '../terminal/types';

type ScrollbackProps = {
  entries: readonly Entry[];
  bootRun: number;
  lastEntryRef: Ref<HTMLElement>;
};

/** The committed history: the boot banner followed by every executed command. */
export default function Scrollback({ entries, bootRun, lastEntryRef }: ScrollbackProps) {
  return (
    <>
      {/* Keyed on bootRun so /clear replays the staggered reveal. */}
      <section className="boot" aria-label="Introduction" key={bootRun}>
        <Output lines={bootLines} />
      </section>

      {entries.map((entry, index) => (
        <section className="entry" key={entry.id} ref={index === entries.length - 1 ? lastEntryRef : null}>
          {entry.input !== null && (
            <div className="row row--echo">
              <Prompt />
              <span className="echo__text">{entry.input}</span>
            </div>
          )}
          <Output lines={entry.lines} />
        </section>
      ))}
    </>
  );
}
