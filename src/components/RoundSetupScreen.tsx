import type { Deck, MotionStatus, RoundSettings } from "../types";
import { MotionPermissionButton } from "./MotionPermissionButton";
import { ScreenLayout } from "./ScreenLayout";

interface RoundSetupScreenProps {
  deck: Deck;
  settings: RoundSettings;
  motionStatus: MotionStatus;
  motionError: string | null;
  onSettingsChange: (settings: RoundSettings) => void;
  onEnableMotion: () => void;
  onStartWithoutMotion: () => void;
  onChooseDeck: () => void;
}

const durations: RoundSettings["durationSeconds"][] = [30, 60, 90, 120];

export function RoundSetupScreen({
  deck,
  settings,
  motionStatus,
  motionError,
  onSettingsChange,
  onEnableMotion,
  onStartWithoutMotion,
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
            <small>Tilt to move through cards. Buttons stay visible.</small>
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
              <small>Forward/down becomes Correct and backward/up becomes Pass.</small>
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
        <div className="button-row">
          {settings.motionEnabled && (
            <MotionPermissionButton status={motionStatus} onEnable={onEnableMotion} />
          )}
          <button
            className={`button ${settings.motionEnabled ? "button--secondary" : "button--primary"}`}
            type="button"
            onClick={onStartWithoutMotion}
          >
            {settings.motionEnabled ? "Start with Buttons" : "Start Round"}
          </button>
        </div>
      </section>
    </ScreenLayout>
  );
}
