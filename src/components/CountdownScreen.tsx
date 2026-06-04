import { useEffect, useRef, useState } from "react";

interface CountdownScreenProps {
  reverseTilt: boolean;
  showTiltHint: boolean;
  onComplete: () => void;
  onCancel: () => void;
}

export function CountdownScreen({ reverseTilt, showTiltHint, onComplete, onCancel }: CountdownScreenProps) {
  const [countdown, setCountdown] = useState(3);
  const completedRef = useRef(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (countdown > 1) {
        setCountdown((current) => current - 1);
        return;
      }

      if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [countdown, onComplete]);

  return (
    <main className="countdown-screen">
      <button className="button button--ghost countdown-screen__cancel" type="button" onClick={onCancel}>
        Cancel
      </button>
      <section className="countdown-card" aria-live="polite">
        <p>Ready?</p>
        <strong>{countdown}</strong>
        {showTiltHint && (
          <small>
            Hold Steady. {reverseTilt ? "Down = Pass. Up = Correct." : "Down = Correct. Up = Pass."}
          </small>
        )}
      </section>
    </main>
  );
}
