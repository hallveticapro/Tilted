import { useState } from "react";
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
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
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
          Change Deck
        </button>
      }
    >
      <section className="panel stack">
        <div>
          <h2>Play Style</h2>
          <div className="segmented-control segmented-control--two" role="group" aria-label="Play Style">
            <button
              className={settings.gameplayStyle === "forehead" && settings.motionEnabled ? "is-selected" : ""}
              type="button"
              onClick={() => update({ gameplayStyle: "forehead", motionEnabled: true })}
            >
              Tilt On
            </button>
            <button
              className={settings.gameplayStyle === "review" || !settings.motionEnabled ? "is-selected" : ""}
              type="button"
              onClick={() => update({ gameplayStyle: "review", motionEnabled: false })}
            >
              Tilt Off
            </button>
          </div>
        </div>
        <div>
          <h2>Round Length</h2>
          <div className="segmented-control" role="group" aria-label="Round Length">
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
            <strong>Sound Effects</strong>
            <small>Play distinct cues for correct answers and passes.</small>
          </span>
          <input
            aria-label="Use Sound Effects"
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
            aria-label="Use Vibration"
            type="checkbox"
            checked={settings.vibrationEnabled}
            onChange={(event) => update({ vibrationEnabled: event.target.checked })}
          />
        </label>

        <button
          className="advanced-settings-toggle"
          type="button"
          aria-expanded={showAdvancedSettings}
          aria-controls="advanced-round-settings"
          onClick={() => setShowAdvancedSettings((current) => !current)}
        >
          <span>Advanced Settings</span>
          <strong aria-hidden="true">{showAdvancedSettings ? "-" : "+"}</strong>
        </button>

        {showAdvancedSettings && (
          <section className="advanced-settings-panel stack" id="advanced-round-settings">
            {settings.gameplayStyle === "forehead" && settings.motionEnabled && (
              <p className="muted motion-start-note">
                Motion access will be requested when you start. During play, tilt down for
                Correct and up to Pass.
              </p>
            )}
            {settings.gameplayStyle === "forehead" && settings.motionEnabled && (
              <label className="toggle-row">
                <span>
                  <strong>Reverse Tilt Directions</strong>
                  <small>Down becomes Pass and up becomes Correct.</small>
                </span>
                <input
                  aria-label="Reverse Tilt Directions"
                  type="checkbox"
                  checked={settings.reverseTilt}
                  onChange={(event) => update({ reverseTilt: event.target.checked })}
                />
              </label>
            )}
            {settings.gameplayStyle === "forehead" && settings.motionEnabled && (
              <button className="button button--secondary" type="button" onClick={onTestMotion}>
                Test Motion Controls
              </button>
            )}
            <label className="toggle-row">
              <span>
                <strong>Fullscreen During Rounds</strong>
                <small>Use the largest stable view when this browser supports fullscreen.</small>
              </span>
              <input
                aria-label="Use Fullscreen During Rounds"
                type="checkbox"
                checked={settings.fullscreenEnabled}
                onChange={(event) => update({ fullscreenEnabled: event.target.checked })}
              />
            </label>
            {settings.gameplayStyle === "forehead" && settings.motionEnabled && (
              <div>
                <h2>Tilt Sensitivity</h2>
                <div className="segmented-control segmented-control--three" role="group" aria-label="Tilt Sensitivity">
                  {(Object.keys(thresholds) as RoundSettings["sensitivityPreset"][]).map((preset) => (
                    <button
                      className={settings.sensitivityPreset === preset ? "is-selected" : ""}
                      key={preset}
                      type="button"
                      onClick={() => update({ sensitivityPreset: preset, tiltThreshold: thresholds[preset] })}
                    >
                      {preset[0].toUpperCase() + preset.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h2>Card Filters</h2>
              <div className="setup-grid">
                <label>
                  <span className="field-label">Difficulty</span>
                  <select
                    value={settings.difficultyFilter}
                    onChange={(event) => update({ difficultyFilter: event.target.value as RoundSettings["difficultyFilter"] })}
                  >
                    <option value="all">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </label>
                <label>
                  <span className="field-label">Subcategory</span>
                  <select value={settings.subcategoryFilter} onChange={(event) => update({ subcategoryFilter: event.target.value })}>
                    <option value="">All Subcategories</option>
                    {subcategories.map((category) => <option key={category}>{category}</option>)}
                  </select>
                </label>
              </div>
              <p className="muted setup-note">{eligibleCardCount} matching cards available.</p>
            </div>
            <label className="toggle-row">
              <span>
                <strong>Cycle Cards If Needed</strong>
                <small>Shuffle and reuse the deck if the team reaches the end before time expires.</small>
              </span>
              <input
                aria-label="Cycle Cards If Needed"
                type="checkbox"
                checked={settings.cycleDeck}
                onChange={(event) => update({ cycleDeck: event.target.checked })}
              />
            </label>
            <label>
              <span className="field-label">Optional Pass Limit</span>
              <select value={settings.passLimit ?? ""} onChange={(event) => update({ passLimit: event.target.value ? Number(event.target.value) : null })}>
                <option value="">No Pass Limit</option>
                <option value="3">3 Passes</option>
                <option value="5">5 Passes</option>
                <option value="10">10 Passes</option>
              </select>
            </label>
          </section>
        )}

        {eligibleCardCount === 0 && (
          <p className="notice notice--warning">
            No cards match the current filters. Open Advanced Settings to change them.
          </p>
        )}
        {motionError && (
          <div className="notice notice--warning stack">
            <p>{motionError}</p>
            {settings.motionEnabled && (
              <button className="button button--secondary" type="button" onClick={onContinueWithoutMotion}>
                Continue With Buttons
              </button>
            )}
          </div>
        )}
        <button className="button button--primary button--large" type="button" disabled={eligibleCardCount === 0} onClick={onStartRound}>
          Start Round
        </button>
      </section>
    </ScreenLayout>
  );
}
