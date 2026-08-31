import type { Node } from '../terminal/types';

const BAR_WIDTH = 10;

function bar(level: number) {
  const filled = Math.max(0, Math.min(BAR_WIDTH, Math.round(level)));
  return { on: '█'.repeat(filled), off: '░'.repeat(BAR_WIDTH - filled) };
}

function Row({ node }: { node: Node }) {
  switch (node.kind) {
    case 'blank':
      return <div className="row row--blank" aria-hidden="true" />;

    case 'rule':
      return <div className="row row--rule" aria-hidden="true" />;

    case 'text':
      return <p className={`row row--text tone-${node.tone ?? 'default'}`}>{node.text}</p>;

    case 'heading':
      return (
        <h2 className="row row--heading">
          <span className="heading__mark">##</span> {node.text}
        </h2>
      );

    case 'meta':
      return (
        <div className="row row--meta">
          <span className="meta__left">{node.left}</span>
          <span className="meta__dots" aria-hidden="true" />
          <span className="meta__right">{node.right}</span>
        </div>
      );

    case 'kv':
      return (
        <div className="row row--kv">
          <span className="kv__key">{node.key}</span>
          <span className="kv__value">
            {node.href ? (
              <a href={node.href} target={node.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                {node.value}
                <span className="link__arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            ) : (
              node.value
            )}
          </span>
        </div>
      );

    case 'tagged':
      return (
        <div className="row row--tagged">
          <span className="tagged__tag">[{node.tag}]</span>
          <span className="tagged__body">{node.body}</span>
        </div>
      );

    case 'bar': {
      const { on, off } = bar(node.level);
      return (
        <div className="row row--bar">
          <span className="bar__label">{node.label}</span>
          <span
            className="bar__track"
            role="img"
            aria-label={`${node.level} out of ${BAR_WIDTH}`}
          >
            <span className="bar__on">{on}</span>
            <span className="bar__off">{off}</span>
          </span>
        </div>
      );
    }

    case 'stat':
      return (
        <div className="row row--stat">
          <span className="stat__value">{node.value}</span>
          <span className="stat__label">{node.label}</span>
        </div>
      );

    case 'cmd':
      return (
        <div className="row row--cmd">
          <span className="cmd__name">{node.name}</span>
          <span className="cmd__dash" aria-hidden="true">
            —
          </span>
          <span className="cmd__desc">{node.desc}</span>
        </div>
      );
  }
}

export default function Output({ nodes }: { nodes: Node[] }) {
  return (
    <>
      {nodes.map((node, i) => (
        <Row key={i} node={node} />
      ))}
    </>
  );
}
