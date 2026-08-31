import { quickCommands } from '../terminal/commands';

/** Footer shortcuts, so the terminal is usable without touching the keyboard. */
export default function Launcher({ onRun }: { onRun: (command: string) => void }) {
  return (
    <footer className="launcher" aria-label="Quick commands">
      <span className="launcher__label">run</span>
      <div className="launcher__buttons">
        {quickCommands.map((command) => (
          <button key={command.name} type="button" onClick={() => onRun(command.name)}>
            {command.name}
          </button>
        ))}
      </div>
    </footer>
  );
}
