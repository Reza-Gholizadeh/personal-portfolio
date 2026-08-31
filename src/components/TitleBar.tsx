import { profile } from '../data/resume';
import { PROMPT_LABEL } from './Prompt';

export default function TitleBar() {
  return (
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
  );
}
