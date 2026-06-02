import { describe, expect, it } from "vitest";
import {
  loadReverseTilt,
  loadSoundEffects,
  loadVibration,
  REVERSE_TILT_KEY,
  saveReverseTilt,
  saveSoundEffects,
  saveVibration,
} from "./preferences";

describe("preferences", () => {
  it("round trips the reverse tilt preference", () => {
    saveReverseTilt(true);

    expect(loadReverseTilt()).toBe(true);
  });

  it("moves the saved preference from the previous app namespace", () => {
    const previousKey = ["tilt", "frenzy.reverseTilt.v1"].join("");
    localStorage.setItem(previousKey, "true");

    expect(loadReverseTilt()).toBe(true);
    expect(localStorage.getItem(REVERSE_TILT_KEY)).toBe("true");
    expect(localStorage.getItem(previousKey)).toBeNull();
  });

  it("defaults feedback preferences on and persists changes", () => {
    expect(loadSoundEffects()).toBe(true);
    expect(loadVibration()).toBe(true);

    saveSoundEffects(false);
    saveVibration(false);

    expect(loadSoundEffects()).toBe(false);
    expect(loadVibration()).toBe(false);
  });
});
