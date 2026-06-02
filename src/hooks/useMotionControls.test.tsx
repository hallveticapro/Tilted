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

function calibrate(
  result: { current: ReturnType<typeof useMotionControls> },
  samples: Array<[number, number]> = [
    [89, 0],
    [90, 0],
    [91, 0],
  ],
) {
  act(() => result.current.startCalibration());
  samples.forEach(([beta, gamma]) => act(() => sendOrientation(beta, gamma)));
  act(() => result.current.finishCalibration());
}

function sendSteadyTilt(beta: number, gamma = 0, sampleCount = 24) {
  for (let index = 0; index < sampleCount; index += 1) {
    act(() => {
      sendOrientation(beta, gamma);
      vi.advanceTimersByTime(20);
    });
  }
}

describe("useMotionControls", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T12:00:00Z"));
    Object.defineProperty(window, "DeviceOrientationEvent", {
      configurable: true,
      value: class DeviceOrientationEvent {},
    });
    Object.defineProperty(window, "DeviceMotionEvent", {
      configurable: true,
      value: class DeviceMotionEvent {},
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("measures the screen face elevation through landscape Euler flips", () => {
    expect(normalizeTiltAxis(90, 0)).toBeCloseTo(0);
    expect(normalizeTiltAxis(0, 90)).toBeCloseTo(0);
    expect(normalizeTiltAxis(0, 40)).toBeCloseTo(50);
    expect(normalizeTiltAxis(180, 40)).toBeCloseTo(-50);
  });

  it("detects the larger movement made while placing the phone on a forehead", async () => {
    const { result } = renderHook(() =>
      useMotionControls({ enabled: true, reverseTilt: false }),
    );

    await act(async () => {
      await result.current.requestPermission();
    });
    act(() => result.current.beginForeheadSetup());
    act(() => sendOrientation(10));
    act(() => sendOrientation(30));
    expect(result.current.foreheadMovementDetected).toBe(false);

    act(() => sendOrientation(50));
    expect(result.current.foreheadMovementDetected).toBe(true);
    expect(result.current.status).toBe("ready");
  });

  it("averages calibration samples and ignores hand twitches", async () => {
    const { result } = renderHook(() =>
      useMotionControls({ enabled: true, reverseTilt: false }),
    );

    await act(async () => {
      await result.current.requestPermission();
    });
    calibrate(result);
    expect(result.current.baseline?.axisValue).toBeCloseTo(0);

    sendSteadyTilt(65);
    act(() => sendOrientation(20));
    sendSteadyTilt(90, 0, 12);
    expect(result.current.lastAction).toBeNull();
  });

  it("requires a deliberate tilt and neutral rearming before the next action", async () => {
    const { result } = renderHook(() =>
      useMotionControls({ enabled: true, reverseTilt: false }),
    );

    await act(async () => {
      await result.current.requestPermission();
    });
    calibrate(result);
    sendSteadyTilt(140);
    expect(result.current.lastAction).toMatchObject({ id: 1, outcome: "correct" });

    sendSteadyTilt(145);
    expect(result.current.lastAction).toMatchObject({ id: 1 });

    sendSteadyTilt(90, 0, 12);
    act(() => vi.advanceTimersByTime(1101));
    sendSteadyTilt(40);
    expect(result.current.lastAction).toMatchObject({ id: 2, outcome: "pass" });
  });

  it("distinguishes down and up tilts from a landscape forehead posture", async () => {
    const { result } = renderHook(() =>
      useMotionControls({ enabled: true, reverseTilt: false }),
    );

    await act(async () => {
      await result.current.requestPermission();
    });
    calibrate(result, [
      [0, 89],
      [0, 90],
      [0, 89],
    ]);
    sendSteadyTilt(180, 40);
    expect(result.current.lastAction).toMatchObject({ id: 1, outcome: "correct" });

    sendSteadyTilt(0, 90, 12);
    act(() => vi.advanceTimersByTime(1101));
    sendSteadyTilt(0, 40);
    expect(result.current.lastAction).toMatchObject({ id: 2, outcome: "pass" });
  });

  it("reverses correct and pass tilt directions", async () => {
    const { result } = renderHook(() =>
      useMotionControls({ enabled: true, reverseTilt: true }),
    );

    await act(async () => {
      await result.current.requestPermission();
    });
    calibrate(result);
    sendSteadyTilt(140);

    expect(result.current.lastAction).toMatchObject({ outcome: "pass" });
  });

  it("reports a missing sample instead of pretending calibration succeeded", async () => {
    const { result } = renderHook(() =>
      useMotionControls({ enabled: true, reverseTilt: false }),
    );

    await act(async () => {
      await result.current.requestPermission();
    });
    act(() => result.current.startCalibration());

    let calibrated = true;
    act(() => {
      calibrated = result.current.finishCalibration();
    });

    expect(calibrated).toBe(false);
    expect(result.current.status).toBe("waiting-for-sample");
    expect(result.current.error).toContain("No tilt sample arrived");
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
