import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { normalizeTiltAxis, useMotionControls } from "./useMotionControls";

function sendOrientation(beta: number, gamma = 0) {
  const event = new Event("deviceorientation") as DeviceOrientationEvent;
  Object.defineProperties(event, {
    beta: { value: beta },
    gamma: { value: gamma },
  });
  window.dispatchEvent(event);
}

describe("useMotionControls", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T12:00:00Z"));
    Object.defineProperty(window, "DeviceOrientationEvent", {
      configurable: true,
      value: class DeviceOrientationEvent {},
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("normalizes portrait and landscape axis values", () => {
    expect(normalizeTiltAxis(40, 15, 0)).toBe(40);
    expect(normalizeTiltAxis(40, 15, 90)).toBe(-15);
    expect(normalizeTiltAxis(40, 15, -90)).toBe(15);
  });

  it("triggers one correct action until neutral rearming and cooldown pass", async () => {
    const { result } = renderHook(() =>
      useMotionControls({ enabled: true, reverseTilt: false }),
    );

    await act(async () => {
      await result.current.requestPermission();
    });
    act(() => sendOrientation(80));
    act(() => result.current.calibrate());
    act(() => sendOrientation(45));
    expect(result.current.lastAction).toMatchObject({ id: 1, outcome: "correct" });

    act(() => sendOrientation(40));
    expect(result.current.lastAction).toMatchObject({ id: 1 });

    act(() => sendOrientation(80));
    act(() => vi.advanceTimersByTime(901));
    act(() => sendOrientation(110));
    expect(result.current.lastAction).toMatchObject({ id: 2, outcome: "pass" });
  });

  it("reverses correct and pass tilt directions", async () => {
    const { result } = renderHook(() =>
      useMotionControls({ enabled: true, reverseTilt: true }),
    );

    await act(async () => {
      await result.current.requestPermission();
    });
    act(() => sendOrientation(80));
    act(() => result.current.calibrate());
    act(() => sendOrientation(45));

    expect(result.current.lastAction).toMatchObject({ outcome: "pass" });
  });

  it("requests every available iOS permission and falls back after denial", async () => {
    const orientationPermission = vi.fn().mockResolvedValue("granted");
    const motionPermission = vi.fn().mockResolvedValue("denied");
    Object.defineProperty(window, "DeviceOrientationEvent", {
      configurable: true,
      value: class DeviceOrientationEvent {
        static requestPermission = orientationPermission;
      },
    });
    Object.defineProperty(window, "DeviceMotionEvent", {
      configurable: true,
      value: class DeviceMotionEvent {
        static requestPermission = motionPermission;
      },
    });
    const { result } = renderHook(() =>
      useMotionControls({ enabled: true, reverseTilt: false }),
    );

    let granted = true;
    await act(async () => {
      granted = await result.current.requestPermission();
    });

    expect(orientationPermission).toHaveBeenCalledTimes(1);
    expect(motionPermission).toHaveBeenCalledTimes(1);
    expect(granted).toBe(false);
    expect(result.current.status).toBe("denied");
    expect(result.current.error).toContain("Touch controls still work");
  });
});
