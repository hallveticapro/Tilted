import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useRoundDisplay } from "./useRoundDisplay";

describe("useRoundDisplay", () => {
  it("uses display enhancements when supported and releases them after a round", async () => {
    const release = vi.fn().mockResolvedValue(undefined);
    const requestWakeLock = vi.fn().mockResolvedValue({ released: false, release });
    const lockOrientation = vi.fn().mockResolvedValue(undefined);
    const unlockOrientation = vi.fn();
    const requestFullscreen = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, "wakeLock", {
      configurable: true,
      value: { request: requestWakeLock },
    });
    Object.defineProperty(window.screen, "orientation", {
      configurable: true,
      value: { lock: lockOrientation, unlock: unlockOrientation },
    });
    Object.defineProperty(document.documentElement, "requestFullscreen", {
      configurable: true,
      value: requestFullscreen,
    });

    const { result } = renderHook(() => useRoundDisplay());
    await act(async () => {
      await result.current.engage(true);
    });
    act(() => document.dispatchEvent(new Event("visibilitychange")));

    expect(requestFullscreen).toHaveBeenCalledTimes(1);
    expect(requestWakeLock).toHaveBeenCalledTimes(1);
    expect(lockOrientation).toHaveBeenCalledWith("landscape");

    await act(async () => {
      await result.current.release();
    });
    expect(release).toHaveBeenCalledTimes(1);
    expect(unlockOrientation).toHaveBeenCalledTimes(1);
  });
});
