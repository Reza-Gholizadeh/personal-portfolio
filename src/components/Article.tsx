import Output from './Output';
import { readingTime, type Post } from '../data/blog';
import { profile } from '../data/resume';
import type { OutputLine } from '../terminal/types';

/**
 * Prose needs a blank line between paragraphs, but the résumé sections do not —
 * a global CSS rule would also loosen the boot banner. Inserting the gap here
 * keeps post data free of layout noise.
 */
const spaceParagraphs = (lines: readonly OutputLine[]): OutputLine[] =>
  lines.flatMap((line, i): OutputLine[] =>
    lines[i - 1]?.kind === 'text' && line.kind === 'text' ? [{ kind: 'blank' }, line] : [line],
  );

/**
 * The full-screen reading view. Deliberately not terminal output: long-form
 * prose wants a measure and a proportional face, so `.article` re-scopes the
 * typography that the rest of the app keeps monospaced.
 */
export default function Article({ post, onClose }: { post: Post; onClose: () => void }) {
  const minutes = readingTime(post);

  return (
    <div className="article">
      <header className="article__bar">
        <button type="button" className="article__back" onClick={onClose}>
          ← cd ~
        </button>
        <span className="article__path">/blog/{post.slug}</span>
        <span className="article__time">{minutes}</span>
      </header>

      <article className="article__body">
        <div className="article__tags">
          {post.tags.map((tag) => (
            <span className="article__tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>

        <h1 className="article__title">{post.title}</h1>

        <div className="article__meta">
          <span>{post.date}</span>
          <span className="article__sep" aria-hidden="true">
            ◆
          </span>
          <span>{minutes}</span>
          <span className="article__sep" aria-hidden="true">
            ◆
          </span>
          <span>{profile.name}</span>
        </div>

        <hr className="article__rule" />

        <div className="article__prose">
          <Output lines={spaceParagraphs(post.body)} />
        </div>
      </article>
    </div>
  );
}
