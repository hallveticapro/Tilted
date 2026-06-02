import { describe, expect, it } from "vitest";
import { canUseBrowserStorage, readStoredValue, removeStoredValue, writeStoredValue } from "./safeStorage";

const unavailableStorage = {
  getItem: () => { throw new Error("blocked"); },
  setItem: () => { throw new Error("blocked"); },
  removeItem: () => { throw new Error("blocked"); },
} as unknown as Storage;

describe("safeStorage", () => {
  it("degrades gracefully when browser storage methods throw", () => {
    expect(readStoredValue(unavailableStorage, "x")).toBeNull();
    expect(writeStoredValue(unavailableStorage, "x", "y")).toBe(false);
    expect(() => removeStoredValue(unavailableStorage, "x")).not.toThrow();
    expect(canUseBrowserStorage(unavailableStorage)).toBe(false);
  });
});
