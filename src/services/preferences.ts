export const REVERSE_TILT_KEY = "tiltfrenzy.reverseTilt.v1";

export function loadReverseTilt(storage: Storage = localStorage): boolean {
  return storage.getItem(REVERSE_TILT_KEY) === "true";
}

export function saveReverseTilt(value: boolean, storage: Storage = localStorage): void {
  storage.setItem(REVERSE_TILT_KEY, String(value));
}
