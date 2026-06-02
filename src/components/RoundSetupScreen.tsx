import type { Deck, RoundSettings } from "../types";
import { ScreenLayout } from "./ScreenLayout";

interface RoundSetupScreenProps {
  deck: Deck;
  settings: RoundSettings;
  motionError: string | null;
  onSettingsChange: (settings: RoundSettings) => void;
  onStartRound: () => void;
  onContinueWithoutMotion: () => void;
  onChooseDeck: () => void;
  onTestMotion: () => void;
}

const durations: RoundSettings["durationSeconds"][] = [30, 60, 90, 120];
const thresholds: Record<RoundSettings["sensitivityPreset"], number> = {
  gentle: 32,
  standard: 40,
  deliberate: 48,
};

export function RoundSetupScreen({
  deck,
  settings,
  motionError,
  onSettingsChange,
  onStartRound,
  onContinueWithoutMotion,
  onChooseDeck,
  onTestMotion,
}: RoundSetupScreenProps) {
  const update = (partial: Partial<RoundSettings>) =>
    onSettingsChange({ ...settings, ...partial });
  const subcategories = Array.from(
    new Set(deck.cards.map(({ category }) => category).filter((category): category is string => Boolean(category))),
  );
  const eligibleCardCount = deck.cards.filter(
    (card) =>
      (settings.difficultyFilter === "all" || card.difficulty === settings.difficultyFilter) &&
      (!settings.subcategoryFilter || card.category === settings.subcategoryFilter),
  ).length;

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
          <h2>Play style</h2>
          <div className="segmented-control segmented-control--two" role="group" aria-label="Play style">
            <button
              className={settings.gameplayStyle === "forehead" ? "is-selected" : ""}
              type="button"
              onClick={() => update({ gameplayStyle: "forehead" })}
            >
              Forehead game
            </button>
            <button
              className={settings.gameplayStyle === "review" ? "is-selected" : ""}
              type="button"
              onClick={() => update({ gameplayStyle: "review" })}
            >
              Teacher review
            </button>
          </div>
        </div>
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
        {settings.gameplayStyle === "forehead" && <label className="toggle-row">
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
        </label>}
        {settings.gameplayStyle === "forehead" && settings.motionEnabled && (
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
        {settings.gameplayStyle === "forehead" && settings.motionEnabled && (
          <button className="button button--secondary" type="button" onClick={onTestMotion}>Test Motion Controls</button>
        )}
        <label className="toggle-row">
          <span>
            <strong>Fullscreen during rounds</strong>
            <small>Use the largest stable view when this browser supports fullscreen.</small>
          </span>
          <input aria-label="Use fullscreen during rounds" type="checkbox" checked={settings.fullscreenEnabled} onChange={(event) => update({ fullscreenEnabled: event.target.checked })} />
        </label>
        {settings.gameplayStyle === "forehead" && settings.motionEnabled && (
          <div>
            <h2>Tilt sensitivity</h2>
            <div className="segmented-control segmented-control--three" role="group" aria-label="Tilt sensitivity">
              {(Object.keys(thresholds) as RoundSettings["sensitivityPreset"][]).map((preset) => (
                <button
                  className={settings.sensitivityPreset === preset ? "is-selected" : ""}
                  key={preset}
                  type="button"
                  onClick={() => update({ sensitivityPreset: preset, tiltThreshold: thresholds[preset] })}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <h2>Card filters</h2>
          <div className="setup-grid">
            <label>
              <span className="field-label">Difficulty</span>
              <select
                value={settings.difficultyFilter}
                onChange={(event) => update({ difficultyFilter: event.target.value as RoundSettings["difficultyFilter"] })}
              >
                <option value="all">All difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>
            <label>
              <span className="field-label">Subcategory</span>
              <select value={settings.subcategoryFilter} onChange={(event) => update({ subcategoryFilter: event.target.value })}>
                <option value="">All subcategories</option>
                {subcategories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
          </div>
          <p className="muted setup-note">{eligibleCardCount} matching cards available.</p>
        </div>
        <label className="toggle-row">
          <span>
            <strong>Cycle cards if needed</strong>
            <small>Shuffle and reuse the deck if the team reaches the end before time expires.</small>
          </span>
          <input aria-label="Cycle cards if needed" type="checkbox" checked={settings.cycleDeck} onChange={(event) => update({ cycleDeck: event.target.checked })} />
        </label>
        <label>
          <span className="field-label">Optional pass limit</span>
          <select value={settings.passLimit ?? ""} onChange={(event) => update({ passLimit: event.target.value ? Number(event.target.value) : null })}>
            <option value="">No pass limit</option>
            <option value="3">3 passes</option>
            <option value="5">5 passes</option>
            <option value="10">10 passes</option>
          </select>
        </label>
        <label className="toggle-row">
          <span>
            <strong>Sound effects</strong>
            <small>Play distinct cues for correct answers and passes.</small>
          </span>
          <input
            aria-label="Use sound effects"
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(event) => update({ soundEnabled: event.target.checked })}
          />
        </label>
        <label className="toggle-row">
          <span>
            <strong>Vibration</strong>
            <small>Use short haptic feedback when this device supports it.</small>
          </span>
          <input
            aria-label="Use vibration"
            type="checkbox"
            checked={settings.vibrationEnabled}
            onChange={(event) => update({ vibrationEnabled: event.target.checked })}
          />
        </label>
        {motionError && (
          <div className="notice notice--warning stack">
            <p>{motionError}</p>
            {settings.motionEnabled && (
              <button className="button button--secondary" type="button" onClick={onContinueWithoutMotion}>
                Continue with buttons
              </button>
            )}
          </div>
        )}
        {settings.gameplayStyle === "forehead" && settings.motionEnabled && (
          <p className="muted motion-start-note">
            Motion access will be requested when you start. During play, tilt down for Correct
            and up to Pass.
          </p>
        )}
        <button className="button button--primary button--large" type="button" disabled={eligibleCardCount === 0} onClick={onStartRound}>
          Start Round
        </button>
      </section>
    </ScreenLayout>
  );
}
