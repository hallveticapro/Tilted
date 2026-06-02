import { ScreenLayout } from "./ScreenLayout";

interface HowToPlayScreenProps {
  onBack: () => void;
}

export function HowToPlayScreen({ onBack }: HowToPlayScreenProps) {
  return (
    <ScreenLayout
      title="How to Play"
      eyebrow="Quick guide"
      compact
      actions={
        <button className="button button--ghost" type="button" onClick={onBack}>
          Home
        </button>
      }
    >
      <section className="panel prose">
        <ol>
          <li>Choose a deck and a round length.</li>
          <li>Turn the phone sideways and hold it where your teammates can see the word.</li>
          <li>Your teammates give clues without saying the word or any part of it.</li>
          <li>Guess the word from their clues. Do not look at the screen.</li>
          <li>Tap Start Round, place the phone on your forehead, and hold still for 3, 2, 1.</li>
          <li>Tilt down for Correct or up to Pass, then return to the starting position.</li>
          <li>
            Use the menu button during a motion round to reveal fallback controls, pause, or
            quit. Button-only rounds keep the controls visible.
          </li>
        </ol>
        <p>
          On a keyboard, use <kbd>→</kbd> for Correct, <kbd>←</kbd> for Pass, and{" "}
          <kbd>Space</kbd> to pause or resume.
        </p>
        <p>
          Use <strong>Team Game</strong> to rotate teams and optional player rosters
          automatically. Use <strong>Teacher review</strong> in round setup for a
          button-controlled classroom round without forehead calibration.
        </p>
        <p>
          On iPhone or iPad, install Tilted by tapping Share and then{" "}
          <strong>Add to Home Screen</strong>. Installed apps may have more reliable access
          to fullscreen and landscape locking where the browser supports them.
        </p>
      </section>
    </ScreenLayout>
  );
}
