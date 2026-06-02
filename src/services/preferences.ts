export const REVERSE_TILT_KEY = "tilted.reverseTilt.v1";
export const SOUND_EFFECTS_KEY = "tilted.soundEffects.v1";
export const VIBRATION_KEY = "tilted.vibration.v1";
const LEGACY_REVERSE_TILT_KEY = ["tilt", "frenzy.reverseTilt.v1"].join("");

function loadBooleanPreference(key: string, defaultValue: boolean, storage: Storage): boolean {
  const stored = storage.getItem(key);
  return stored === null ? defaultValue : stored === "true";
}

function saveBooleanPreference(key: string, value: boolean, storage: Storage): void {
  storage.setItem(key, String(value));
}

export function loadReverseTilt(storage: Storage = localStorage): boolean {
  const stored = storage.getItem(REVERSE_TILT_KEY) ?? storage.getItem(LEGACY_REVERSE_TILT_KEY);
  if (stored !== null) {
    storage.setItem(REVERSE_TILT_KEY, stored);
    storage.removeItem(LEGACY_REVERSE_TILT_KEY);
  }
  return stored === "true";
}

export function saveReverseTilt(value: boolean, storage: Storage = localStorage): void {
  saveBooleanPreference(REVERSE_TILT_KEY, value, storage);
}

export function loadSoundEffects(storage: Storage = localStorage): boolean {
  return loadBooleanPreference(SOUND_EFFECTS_KEY, true, storage);
}

export function saveSoundEffects(value: boolean, storage: Storage = localStorage): void {
  saveBooleanPreference(SOUND_EFFECTS_KEY, value, storage);
}

export function loadVibration(storage: Storage = localStorage): boolean {
  return loadBooleanPreference(VIBRATION_KEY, true, storage);
}

export function saveVibration(value: boolean, storage: Storage = localStorage): void {
  saveBooleanPreference(VIBRATION_KEY, value, storage);
}
