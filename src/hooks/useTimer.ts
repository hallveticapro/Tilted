import { useCallback, useEffect, useRef, useState } from "react";

interface UseTimerOptions {
  durationSeconds: number;
  running?: boolean;
  onExpire?: () => void;
}

export function useTimer({
  durationSeconds,
  running = true,
  onExpire,
}: UseTimerOptions) {
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const onExpireRef = useRef(onExpire);
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!running || isPaused || hasExpiredRef.current) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId);
          if (!hasExpiredRef.current) {
            hasExpiredRef.current = true;
            onExpireRef.current?.();
          }
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isPaused, running]);

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);
  const togglePause = useCallback(() => setIsPaused((current) => !current), []);

  const reset = useCallback((seconds = durationSeconds) => {
    hasExpiredRef.current = false;
    setRemainingSeconds(seconds);
    setIsPaused(false);
  }, [durationSeconds]);

  return {
    remainingSeconds,
    isPaused,
    pause,
    resume,
    togglePause,
    reset,
  };
}
