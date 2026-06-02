import type { Deck, RoundSettings } from "../types";
import { ScreenLayout } from "./ScreenLayout";

interface RoundSetupScreenProps {
  deck: Deck;
  settings: RoundSettings;
  motionError: string | null;
  onSettingsChange: (settings: RoundSettings) => void;
  onStartRound: () => void;
  onChooseDeck: () => void;
}

const durations: RoundSettings["durationSeconds"][] = [30, 60, 90, 120];

export function RoundSetupScreen({
  deck,
  settings,
  motionError,
  onSettingsChange,
  onStartRound,
  onChooseDeck,
}: RoundSetupScreenProps) {
  const update = (partial: Partial<RoundSettings>) =>
    onSettingsChange({ ...settings, ...partial });

  return (
    <ScreenLayout
      title="Round Setup"
      eyebrow={deck.name}
      compact
      actions={
        <button className="button button--ghost" type="button" onClick={onChooseDeck}>
          Change deck
        </button>
      }
    >
      <section className="panel stack">
        <p className="muted setup-note">
          Hold the phone sideways with the screen facing your teammates. They describe each
          word without saying it while you guess.
        </p>
        <div>
          <h2>Round length</h2>
          <div className="segmented-control" role="group" aria-label="Round length">
            {durations.map((duration) => (
              <button
                className={settings.durationSeconds === duration ? "is-selected" : ""}
                key={duration}
                type="button"
                onClick={() => update({ durationSeconds: duration })}
              >
                {duration}s
              </button>
            ))}
          </div>
        </div>
        <label className="toggle-row">
          <span>
            <strong>Motion controls</strong>
            <small>Tilt to move through cards. Fallback buttons stay in the menu.</small>
          </span>
          <input
            aria-label="Use motion controls"
            type="checkbox"
            checked={settings.motionEnabled}
            onChange={(event) => update({ motionEnabled: event.target.checked })}
          />
        </label>
        {settings.motionEnabled && (
          <label className="toggle-row">
            <span>
              <strong>Reverse tilt directions</strong>
              <small>Down becomes Pass and up becomes Correct.</small>
            </span>
            <input
              aria-label="Reverse tilt directions"
              type="checkbox"
              checked={settings.reverseTilt}
              onChange={(event) => update({ reverseTilt: event.target.checked })}
            />
          </label>
        )}
        {motionError && <p className="notice notice--warning">{motionError}</p>}
        {settings.motionEnabled && (
          <p className="muted motion-start-note">
            Motion access will be requested when you start. During play, tilt down for Correct
            and up to Pass.
          </p>
        )}
        <button className="button button--primary button--large" type="button" onClick={onStartRound}>
          Start Round
        </button>
      </section>
    </ScreenLayout>
  );
}
