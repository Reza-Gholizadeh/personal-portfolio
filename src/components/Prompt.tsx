import { profile } from '../data/resume';

export const PROMPT_LABEL = `${profile.handle}@${profile.host}`;

/**
 * The `user@host ~ $` sigil. Rendered as a <label> on the live input line so
 * clicking it focuses the field, and as a plain <span> on echoed history.
 */
export default function Prompt({ htmlFor }: { htmlFor?: string }) {
  const parts = (
    <>
      <span className="prompt__user">{PROMPT_LABEL}</span>
      <span className="prompt__path">~</span>
      <span className="prompt__sigil">$</span>
    </>
  );

  return htmlFor ? (
    <label className="prompt" htmlFor={htmlFor}>
      {parts}
    </label>
  ) : (
    <span className="prompt">{parts}</span>
  );
}
