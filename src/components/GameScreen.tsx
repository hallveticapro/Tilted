import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTimer } from "../hooks/useTimer";
import type {
  Card,
  CardOutcome,
  Deck,
  MotionStatus,
  RoundCardResult,
  RoundResult,
  RoundSettings,
  TiltAction,
} from "../types";

interface GameScreenProps {
  deck: Deck;
  settings: RoundSettings;
  motionStatus: MotionStatus;
  motionAction: TiltAction | null;
  onRoundEnd: (result: RoundResult) => void;
}

function shuffled<T>(items: T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function buildRoundResult(
  deck: Deck,
  durationSeconds: number,
  outcomes: RoundCardResult[],
): RoundResult {
  return {
    deckId: deck.id,
    deckName: deck.name,
    durationSeconds,
    correctCards: outcomes.filter(({ outcome }) => outcome === "correct").map(({ card }) => card),
    passedCards: outcomes.filter(({ outcome }) => outcome === "pass").map(({ card }) => card),
  };
}

export function GameScreen({
  deck,
  settings,
  motionStatus,
  motionAction,
  onRoundEnd,
}: GameScreenProps) {
  const cards = useMemo(() => shuffled(deck.cards), [deck.cards]);
  const [cardIndex, setCardIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [passCount, setPassCount] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [feedback, setFeedback] = useState<CardOutcome | null>(null);
  const outcomesRef = useRef<RoundCardResult[]>([]);
  const finishedRef = useRef(false);
  const handledMotionActionRef = useRef(0);

  const finishRound = useCallback(
    (outcomes = outcomesRef.current) => {
      if (finishedRef.current) {
        return;
      }

      finishedRef.current = true;
      onRoundEnd(buildRoundResult(deck, settings.durationSeconds, outcomes));
    },
    [deck, onRoundEnd, settings.durationSeconds],
  );

  const { remainingSeconds, isPaused, togglePause } = useTimer({
    durationSeconds: settings.durationSeconds,
    onExpire: finishRound,
  });

  const recordOutcome = useCallback(
    (outcome: CardOutcome) => {
      if (finishedRef.current || isPaused) {
        return;
      }

      const card = cards[cardIndex];
      if (!card) {
        finishRound();
        return;
      }

      const nextOutcomes = [...outcomesRef.current, { card, outcome }];
      outcomesRef.current = nextOutcomes;
      setFeedback(outcome);
      setShowAnswer(false);

      if (typeof navigator.vibrate === "function") {
        navigator.vibrate(outcome === "correct" ? 70 : [45, 35, 45]);
      }

      if (outcome === "correct") {
        setScore((current) => current + 1);
      } else {
        setPassCount((current) => current + 1);
      }

      window.setTimeout(() => setFeedback(null), 350);

      if (cardIndex + 1 >= cards.length) {
        window.setTimeout(() => finishRound(nextOutcomes), 220);
      } else {
        setCardIndex((current) => current + 1);
      }
    },
    [cardIndex, cards, finishRound, isPaused],
  );

  useEffect(() => {
    if (!motionAction || motionAction.id === handledMotionActionRef.current) {
      return;
    }

    handledMotionActionRef.current = motionAction.id;
    recordOutcome(motionAction.outcome);
  }, [motionAction, recordOutcome]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        recordOutcome("correct");
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        recordOutcome("pass");
      } else if (event.code === "Space") {
        event.preventDefault();
        togglePause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [recordOutcome, togglePause]);

  const currentCard: Card | undefined = cards[cardIndex];

  return (
    <main className={`game-screen ${feedback ? `game-screen--${feedback}` : ""}`}>
      <header className="game-hud">
        <div>
          <span>Time</span>
          <strong>{remainingSeconds}</strong>
        </div>
        <div>
          <span>Score</span>
          <strong>{score}</strong>
        </div>
        <div>
          <span>Pass</span>
          <strong>{passCount}</strong>
        </div>
        <div className={`motion-pill motion-pill--${motionStatus}`}>
          <span>Motion</span>
          <strong>{settings.motionEnabled && motionStatus === "calibrated" ? "On" : "Buttons"}</strong>
        </div>
      </header>

      <section className="game-card" aria-live="polite">
        {isPaused ? (
          <div className="game-card__paused">
            <p>Round paused</p>
            <button className="button button--primary" type="button" onClick={togglePause}>
              Resume
            </button>
          </div>
        ) : (
          <>
            <p className="game-card__category">{currentCard?.category ?? deck.name}</p>
            <h1>{currentCard?.prompt}</h1>
            {currentCard?.answer && (
              <div className="answer-reveal">
                {showAnswer ? (
                  <p>
                    Answer: <strong>{currentCard.answer}</strong>
                  </p>
                ) : (
                  <button
                    className="button button--ghost button--small"
                    type="button"
                    onClick={() => setShowAnswer(true)}
                  >
                    Reveal answer
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </section>

      <section className="game-actions" aria-label="Card actions">
        <button
          className="game-action game-action--pass"
          type="button"
          disabled={isPaused}
          onClick={() => recordOutcome("pass")}
        >
          <span aria-hidden="true">←</span>
          Pass
        </button>
        <button className="pause-button" type="button" onClick={togglePause}>
          {isPaused ? "Resume" : "Pause"}
        </button>
        <button
          className="game-action game-action--correct"
          type="button"
          disabled={isPaused}
          onClick={() => recordOutcome("correct")}
        >
          Correct
          <span aria-hidden="true">→</span>
        </button>
      </section>
    </main>
  );
}
