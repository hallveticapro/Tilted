import {
  getBrowserStorage,
  readStoredValue,
  removeStoredValue,
  writeStoredValue,
} from "./safeStorage";

export const REVERSE_TILT_KEY = "tilted.reverseTilt.v1";
export const SOUND_EFFECTS_KEY = "tilted.soundEffects.v1";
export const VIBRATION_KEY = "tilted.vibration.v1";
export const SENSITIVITY_KEY = "tilted.sensitivity.v1";
export const CLASSROOM_ONLY_KEY = "tilted.classroomOnly.v1";
export const FAVORITE_DECKS_KEY = "tilted.favoriteDecks.v1";
const LEGACY_REVERSE_TILT_KEY = ["tilt", "frenzy.reverseTilt.v1"].join("");

function loadBooleanPreference(key: string, defaultValue: boolean, storage?: Storage): boolean {
  const stored = readStoredValue(getBrowserStorage(storage), key);
  return stored === null ? defaultValue : stored === "true";
}

function saveBooleanPreference(key: string, value: boolean, storage?: Storage): void {
  writeStoredValue(getBrowserStorage(storage), key, String(value));
}

export function loadReverseTilt(storage?: Storage): boolean {
  const browserStorage = getBrowserStorage(storage);
  const stored =
    readStoredValue(browserStorage, REVERSE_TILT_KEY) ??
    readStoredValue(browserStorage, LEGACY_REVERSE_TILT_KEY);
  if (stored !== null) {
    writeStoredValue(browserStorage, REVERSE_TILT_KEY, stored);
    removeStoredValue(browserStorage, LEGACY_REVERSE_TILT_KEY);
  }
  return stored === "true";
}

export function saveReverseTilt(value: boolean, storage?: Storage): void {
  saveBooleanPreference(REVERSE_TILT_KEY, value, storage);
}

export function loadSoundEffects(storage?: Storage): boolean {
  return loadBooleanPreference(SOUND_EFFECTS_KEY, true, storage);
}

export function saveSoundEffects(value: boolean, storage?: Storage): void {
  saveBooleanPreference(SOUND_EFFECTS_KEY, value, storage);
}

export function loadVibration(storage?: Storage): boolean {
  return loadBooleanPreference(VIBRATION_KEY, true, storage);
}

export function saveVibration(value: boolean, storage?: Storage): void {
  saveBooleanPreference(VIBRATION_KEY, value, storage);
}

export function loadSensitivity(storage?: Storage): "gentle" | "standard" | "deliberate" {
  const stored = readStoredValue(getBrowserStorage(storage), SENSITIVITY_KEY);
  return stored === "gentle" || stored === "deliberate" ? stored : "standard";
}

export function saveSensitivity(
  value: "gentle" | "standard" | "deliberate",
  storage?: Storage,
): void {
  writeStoredValue(getBrowserStorage(storage), SENSITIVITY_KEY, value);
}

export function loadClassroomOnly(storage?: Storage): boolean {
  return loadBooleanPreference(CLASSROOM_ONLY_KEY, false, storage);
}

export function saveClassroomOnly(value: boolean, storage?: Storage): void {
  saveBooleanPreference(CLASSROOM_ONLY_KEY, value, storage);
}

export function loadFavoriteDecks(storage?: Storage): string[] {
  const stored = readStoredValue(getBrowserStorage(storage), FAVORITE_DECKS_KEY);
  if (!stored) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

export function saveFavoriteDecks(deckIds: string[], storage?: Storage): void {
  writeStoredValue(
    getBrowserStorage(storage),
    FAVORITE_DECKS_KEY,
    JSON.stringify(Array.from(new Set(deckIds))),
  );
}
