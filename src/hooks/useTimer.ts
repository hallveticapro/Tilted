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
  const deadlineRef = useRef(Date.now() + durationSeconds * 1000);
  const pausedRemainingMsRef = useRef(durationSeconds * 1000);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!running || isPaused || hasExpiredRef.current) {
      return;
    }

    const update = () => {
      const nextRemainingMs = Math.max(0, deadlineRef.current - Date.now());
      setRemainingSeconds(Math.ceil(nextRemainingMs / 1000));
      if (nextRemainingMs === 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        onExpireRef.current?.();
      }
    };
    const intervalId = window.setInterval(update, 250);
    document.addEventListener("visibilitychange", update);
    update();

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", update);
    };
  }, [isPaused, running]);

  const pause = useCallback(() => {
    pausedRemainingMsRef.current = Math.max(0, deadlineRef.current - Date.now());
    setIsPaused(true);
  }, []);
  const resume = useCallback(() => {
    deadlineRef.current = Date.now() + pausedRemainingMsRef.current;
    setIsPaused(false);
  }, []);
  const togglePause = useCallback(() => {
    setIsPaused((current) => {
      if (current) {
        deadlineRef.current = Date.now() + pausedRemainingMsRef.current;
      } else {
        pausedRemainingMsRef.current = Math.max(0, deadlineRef.current - Date.now());
      }
      return !current;
    });
  }, []);

  const reset = useCallback((seconds = durationSeconds) => {
    hasExpiredRef.current = false;
    deadlineRef.current = Date.now() + seconds * 1000;
    pausedRemainingMsRef.current = seconds * 1000;
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
