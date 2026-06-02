import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTimer } from "../hooks/useTimer";
import { playOutcomeSound } from "../services/audio";
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
  onQuit: () => void;
}

const FEEDBACK_DURATION_MS = 500;

export function shuffleCards<T>(items: T[]): T[] {
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
  onQuit,
}: GameScreenProps) {
  const cards = useMemo(() => shuffleCards(deck.cards), [deck.cards]);
  const [cardIndex, setCardIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [passCount, setPassCount] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [feedback, setFeedback] = useState<CardOutcome | null>(null);
  const outcomesRef = useRef<RoundCardResult[]>([]);
  const finishedRef = useRef(false);
  const handledMotionActionRef = useRef(0);
  const feedbackTimeoutRef = useRef<number | null>(null);

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
      if (feedbackTimeoutRef.current !== null) {
        window.clearTimeout(feedbackTimeoutRef.current);
      }
      feedbackTimeoutRef.current = window.setTimeout(() => {
        setFeedback(null);
        feedbackTimeoutRef.current = null;
      }, FEEDBACK_DURATION_MS);

      if (typeof navigator.vibrate === "function") {
        navigator.vibrate(outcome === "correct" ? 70 : [45, 35, 45]);
      }
      playOutcomeSound(outcome);

      if (outcome === "correct") {
        setScore((current) => current + 1);
      } else {
        setPassCount((current) => current + 1);
      }

      if (cardIndex + 1 >= cards.length) {
        window.setTimeout(() => finishRound(nextOutcomes), FEEDBACK_DURATION_MS);
      } else {
        setCardIndex((current) => current + 1);
      }
    },
    [cardIndex, cards, finishRound, isPaused],
  );

  useEffect(
    () => () => {
      if (feedbackTimeoutRef.current !== null) {
        window.clearTimeout(feedbackTimeoutRef.current);
      }
    },
    [],
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
  const promptLength = currentCard?.prompt.length ?? 0;
  const promptSizeClass =
    promptLength > 80
      ? "game-card__prompt--extra-long"
      : promptLength > 48
        ? "game-card__prompt--long"
        : "";
  const hasActiveMotion = settings.motionEnabled && motionStatus === "calibrated";
  const showMenuButton = hasActiveMotion && !isPaused;
  const showActionPanel = !isPaused && (!hasActiveMotion || showControls);

  return (
    <main
      className={`game-screen ${showActionPanel ? "game-screen--actions-visible" : ""} ${
        feedback ? `game-screen--${feedback}` : ""
      }`}
    >
      {feedback && (
        <div className={`feedback-flash feedback-flash--${feedback}`} role="status">
          <strong>{feedback === "correct" ? "Correct!" : "Pass"}</strong>
        </div>
      )}
      <header className="game-topbar">
        <div className="game-hud">
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
        </div>
        {showMenuButton && (
          <button
            className="game-menu-button"
            type="button"
            aria-controls="optional-card-actions"
            aria-expanded={showControls}
            aria-label={showControls ? "Hide controls" : "Show controls"}
            onClick={() => setShowControls((current) => !current)}
          >
            <span className="game-menu-button__icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        )}
      </header>

      <section className="game-card" aria-live="polite">
        {isPaused ? (
          <div className="game-card__paused">
            <p>Round paused</p>
            <div className="game-card__paused-actions">
              <button className="button button--primary" type="button" onClick={togglePause}>
                Resume
              </button>
              <button className="button button--danger" type="button" onClick={onQuit}>
                Quit Round
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="game-card__category">{currentCard?.category ?? deck.name}</p>
            <h1 className={`game-card__prompt ${promptSizeClass}`}>{currentCard?.prompt}</h1>
            {currentCard?.answer && (
              <div className="answer-reveal">
                {showAnswer ? (
                  <p>
                    Hint: <strong>{currentCard.answer}</strong>
                  </p>
                ) : (
                  <button
                    className="button button--ghost button--small"
                    type="button"
                    onClick={() => setShowAnswer(true)}
                  >
                    Reveal hint
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {showActionPanel && (
        <section id="optional-card-actions" className="game-actions" aria-label="Card actions">
          <button
            className="game-action game-action--pass"
            type="button"
            onClick={() => recordOutcome("pass")}
          >
            <span aria-hidden="true">←</span>
            Pass
          </button>
          <button className="pause-button" type="button" onClick={togglePause}>
            Pause
          </button>
          <button
            className="game-action game-action--correct"
            type="button"
            onClick={() => recordOutcome("correct")}
          >
            Correct
            <span aria-hidden="true">→</span>
          </button>
        </section>
      )}
    </main>
  );
}
