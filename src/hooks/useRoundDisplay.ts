import { useCallback, useEffect, useRef } from "react";

interface WakeLockSentinel {
  released?: boolean;
  addEventListener?: (type: "release", listener: () => void) => void;
  release: () => Promise<void>;
}

type WakeLockNavigator = Navigator & {
  wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinel> };
};

type LockableScreen = Screen & {
  orientation?: ScreenOrientation & {
    lock?: (orientation: "landscape") => Promise<void>;
    unlock?: () => void;
  };
};

export function useRoundDisplay() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const activeRef = useRef(false);

  const requestWakeLock = useCallback(async () => {
    if (wakeLockRef.current && !wakeLockRef.current.released) {
      return;
    }
    try {
      const sentinel = await (navigator as WakeLockNavigator).wakeLock?.request("screen") ?? null;
      wakeLockRef.current = sentinel;
      sentinel?.addEventListener?.("release", () => {
        if (wakeLockRef.current === sentinel) {
          wakeLockRef.current = null;
        }
      });
    } catch {
      wakeLockRef.current = null;
    }
  }, []);

  const engage = useCallback(async (fullscreen: boolean) => {
    activeRef.current = true;
    if (fullscreen && !document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen?.();
      } catch {
        // Fullscreen is a progressive enhancement and can be denied by the browser.
      }
    }
    await requestWakeLock();
    try {
      await (window.screen as LockableScreen).orientation?.lock?.("landscape");
    } catch {
      // Orientation lock is commonly limited to fullscreen or installed PWAs.
    }
  }, [requestWakeLock]);

  const release = useCallback(async () => {
    activeRef.current = false;
    try {
      await wakeLockRef.current?.release();
    } catch {
      // The operating system may already have released the lock.
    }
    wakeLockRef.current = null;
    try {
      (window.screen as LockableScreen).orientation?.unlock?.();
    } catch {
      // Unlock is best-effort.
    }
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen?.();
      } catch {
        // The player can still leave fullscreen through browser controls.
      }
    }
  }, []);

  useEffect(() => {
    const refresh = () => {
      if (activeRef.current && document.visibilityState === "visible") {
        void requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, [requestWakeLock]);

  useEffect(() => () => {
    void wakeLockRef.current?.release();
  }, []);

  return { engage, release };
}
