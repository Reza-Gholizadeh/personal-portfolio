import type { OutputLine } from '../terminal/types';

const BAR_SEGMENTS = 10;

/** Splits a 0–10 level into filled and empty bar segments. */
function segmentsFor(level: number) {
  const filled = Math.max(0, Math.min(BAR_SEGMENTS, Math.round(level)));
  return { filled: '█'.repeat(filled), empty: '░'.repeat(BAR_SEGMENTS - filled) };
}

/**
 * Makes the switch below exhaustive: adding a variant to `OutputLine` without
 * a matching case becomes a compile error rather than a silently blank row.
 */
function assertNever(line: never): never {
  throw new Error(`Unhandled output line: ${JSON.stringify(line)}`);
}

function Line({ line }: { line: OutputLine }) {
  switch (line.kind) {
    case 'blank':
      return <div className="row row--blank" aria-hidden="true" />;

    case 'rule':
      return <div className="row row--rule" aria-hidden="true" />;

    case 'text':
      return <p className={`row row--text tone-${line.tone ?? 'default'}`}>{line.text}</p>;

    case 'heading':
      return (
        <h2 className="row row--heading">
          <span className="heading__mark">##</span> {line.text}
        </h2>
      );

    case 'meta':
      return (
        <div className="row row--meta">
          <span className="meta__left">{line.left}</span>
          <span className="meta__dots" aria-hidden="true" />
          <span className="meta__right">{line.right}</span>
        </div>
      );

    case 'kv': {
      const isExternal = line.href?.startsWith('http') ?? false;
      return (
        <div className="row row--kv">
          <span className="kv__key">{line.key}</span>
          <span className="kv__value">
            {line.href ? (
              <a
                href={line.href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noreferrer noopener' : undefined}
              >
                {line.value}
                <span className="link__arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            ) : (
              line.value
            )}
          </span>
        </div>
      );
    }

    case 'tagged':
      return (
        <div className="row row--tagged">
          <span className="tagged__tag">[{line.tag}]</span>
          <span className="tagged__body">{line.body}</span>
        </div>
      );

    case 'bar': {
      const { filled, empty } = segmentsFor(line.level);
      return (
        <div className="row row--bar">
          <span className="bar__label">{line.label}</span>
          <span className="bar__track" role="img" aria-label={`${line.level} out of ${BAR_SEGMENTS}`}>
            <span className="bar__on">{filled}</span>
            <span className="bar__off">{empty}</span>
          </span>
        </div>
      );
    }

    case 'stat':
      return (
        <div className="row row--stat">
          <span className="stat__value">{line.value}</span>
          <span className="stat__label">{line.label}</span>
        </div>
      );

    case 'cmd':
      return (
        <div className="row row--cmd">
          <span className="cmd__name">{line.name}</span>
          <span className="cmd__dash" aria-hidden="true">
            —
          </span>
          <span className="cmd__desc">{line.desc}</span>
        </div>
      );

    default:
      return assertNever(line);
  }
}

export default function Output({ lines }: { lines: readonly OutputLine[] }) {
  return (
    <>
      {/* Index keys are safe here: a rendered block is immutable — lines are
          never inserted, reordered or removed once committed. */}
      {lines.map((line, index) => (
        <Line key={index} line={line} />
      ))}
    </>
  );
}
