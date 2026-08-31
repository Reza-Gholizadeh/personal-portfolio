import React from 'react';
import type { OutputLine, Tone } from '../terminal/types';

/** Narrows the union to the one member with the given `kind`. */
type LineOf<K extends OutputLine['kind']> = Extract<OutputLine, { kind: K }>;

/** One renderer per line kind. */
type Renderers = { [K in OutputLine['kind']]: (line: LineOf<K>) => React.ReactElement };

const Link = ({ href, label }: { href: string; label: string }) => {
  const isExternal = href.startsWith('http');
  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noreferrer noopener' : undefined}
    >
      {label}
      <span className="link__arrow" aria-hidden="true">
        ↗
      </span>
    </a>
  );
};

/**
 * A lookup table rather than a switch: each line kind is an independent
 * presentational function, and the mapped type makes a missing or misnamed kind
 * a compile error instead of a silently blank row.
 */
const renderers: Renderers = {
  blank: () => <div className="row row--blank" aria-hidden="true" />,

  rule: () => <div className="row row--rule" aria-hidden="true" />,

  text: ({ text, tone = 'default' as Tone }) => <p className={`row row--text tone-${tone}`}>{text}</p>,

  heading: ({ text }) => (
    <h2 className="row row--heading">
      <span className="heading__mark">##</span> {text}
    </h2>
  ),

  meta: ({ left, right }) => (
    <div className="row row--meta">
      <span className="meta__left">{left}</span>
      <span className="meta__dots" aria-hidden="true" />
      <span className="meta__right">{right}</span>
    </div>
  ),

  kv: ({ key: label, value, href }) => (
    <div className="row row--kv">
      <span className="kv__key">{label}</span>
      <span className="kv__value">{href ? <Link href={href} label={value} /> : value}</span>
    </div>
  ),

  tagged: ({ tag, body }) => (
    <div className="row row--tagged">
      <span className="tagged__tag">[{tag}]</span>
      <span className="tagged__body">{body}</span>
    </div>
  ),

  tags: ({ label, items }) => (
    <div className="row row--tags">
      <span className="tags__label">{label}</span>
      <span className="tags__items">
        {items.map((item) => (
          <span className="tags__item" key={item}>
            {item}
          </span>
        ))}
      </span>
    </div>
  ),

  stat: ({ value, label }) => (
    <div className="row row--stat">
      <span className="stat__value">{value}</span>
      <span className="stat__label">{label}</span>
    </div>
  ),

  cmd: ({ name, desc }) => (
    <div className="row row--cmd">
      <span className="cmd__name">{name}</span>
      <span className="cmd__dash" aria-hidden="true">
        —
      </span>
      <span className="cmd__desc">{desc}</span>
    </div>
  ),
};

const render = (line: OutputLine) => (renderers[line.kind] as (l: OutputLine) => React.ReactElement)(line);

export default function Output({ lines }: { lines: readonly OutputLine[] }) {
  return (
    <>
      {/* Index keys are safe here: a rendered block is immutable — lines are
          never inserted, reordered or removed once committed. */}
      {lines.map((line, index) => (
        <React.Fragment key={index}>{render(line)}</React.Fragment>
      ))}
    </>
  );
}
