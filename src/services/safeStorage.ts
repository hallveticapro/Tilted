export function getBrowserStorage(storage?: Storage): Storage | null {
  if (storage) {
    return storage;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readStoredValue(storage: Storage | null, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function removeStoredValue(storage: Storage | null, key: string): void {
  try {
    storage?.removeItem(key);
  } catch {
    // Storage can be unavailable in privacy modes and embedded contexts.
  }
}

export function writeStoredValue(storage: Storage | null, key: string, value: string): boolean {
  try {
    storage?.setItem(key, value);
    return storage !== null;
  } catch {
    return false;
  }
}

export function canUseBrowserStorage(storage?: Storage): boolean {
  const browserStorage = getBrowserStorage(storage);
  if (!browserStorage) {
    return false;
  }
  const key = "tilted.storageCheck";
  if (!writeStoredValue(browserStorage, key, "ok")) {
    return false;
  }
  removeStoredValue(browserStorage, key);
  return true;
}
