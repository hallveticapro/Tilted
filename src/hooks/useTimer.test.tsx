import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useTimer } from "./useTimer";

describe("useTimer", () => {
  it("counts down, pauses, resumes, and expires once", () => {
    vi.useFakeTimers();
    const onExpire = vi.fn();
    const { result } = renderHook(() =>
      useTimer({ durationSeconds: 2, onExpire }),
    );

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.remainingSeconds).toBe(1);

    act(() => result.current.pause());
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.remainingSeconds).toBe(1);

    act(() => result.current.resume());
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.remainingSeconds).toBe(0);
    expect(onExpire).toHaveBeenCalledTimes(1);

    act(() => vi.advanceTimersByTime(2000));
    expect(onExpire).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
