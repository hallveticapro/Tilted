import { useEffect, useRef, useState } from "react";
import { ScreenLayout } from "./ScreenLayout";

interface CalibrationScreenProps {
  onCalibrate: () => boolean;
  onComplete: () => void;
  onCancel: () => void;
}

export function CalibrationScreen({
  onCalibrate,
  onComplete,
  onCancel,
}: CalibrationScreenProps) {
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
        onCalibrate();
        onComplete();
      }
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [countdown, onCalibrate, onComplete]);

  return (
    <ScreenLayout
      title="Hold the phone in starting position."
      eyebrow="Calibrating motion"
      compact
      actions={
        <button className="button button--ghost" type="button" onClick={onCancel}>
          Cancel
        </button>
      }
    >
      <section className="calibration-card" aria-live="polite">
        <strong>{countdown}</strong>
        <p>Keep the phone still and comfortable.</p>
      </section>
    </ScreenLayout>
  );
}
