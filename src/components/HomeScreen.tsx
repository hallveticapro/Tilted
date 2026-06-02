import { useState } from "react";
import { AboutModal } from "./AboutModal";
import { ScreenLayout } from "./ScreenLayout";

interface HomeScreenProps {
  onPlay: () => void;
  onTeamGame: () => void;
  onHistory: () => void;
  onEditDecks: () => void;
  onHowToPlay: () => void;
}

export function HomeScreen({ onPlay, onTeamGame, onHistory, onEditDecks, onHowToPlay }: HomeScreenProps) {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      <ScreenLayout
        title="Tilted"
        eyebrow="Team clues, quick guesses"
        actions={
          <button className="info-button" type="button" aria-label="About Tilted" onClick={() => setShowAbout(true)}>
            i
          </button>
        }
      >
        <section className="hero-panel">
          <img
            className="hero-panel__logo"
            src="./assets/tilted-hero-mark.png"
            alt=""
            aria-hidden="true"
          />
          <div>
            <p className="hero-panel__intro">
              Hold up a phone while teammates describe the word. Guess fast, then tilt for the
              next card.
            </p>
            <p className="muted">Motion controls are optional. Touch buttons always work.</p>
          </div>
        </section>
        <section className="stack stack--large" aria-label="Main menu">
          <button className="button button--primary button--large" type="button" onClick={onPlay}>
            Quick Round
          </button>
          <button className="button button--secondary button--large" type="button" onClick={onTeamGame}>
            Team Game
          </button>
          <button className="button button--secondary" type="button" onClick={onEditDecks}>
            Create/Edit Decks
          </button>
          <button className="button button--ghost" type="button" onClick={onHowToPlay}>
            How to Play
          </button>
          <button className="button button--ghost" type="button" onClick={onHistory}>
            Round History
          </button>
        </section>
      </ScreenLayout>
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </>
  );
}
