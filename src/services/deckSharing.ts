import type { Deck } from "../types";
import { exportDeck, importDeck } from "./deckStorage";

function encode(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decode(text: string): string {
  const normalized = text.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized);
  return new TextDecoder().decode(Uint8Array.from(binary, (character) => character.charCodeAt(0)));
}

export function createDeckShareUrl(deck: Deck): string {
  const url = new URL(window.location.href);
  url.hash = `deck=${encode(exportDeck(deck))}`;
  return url.toString();
}

export function readSharedDeckFromLocation(): Deck | null {
  if (!window.location.hash.startsWith("#deck=")) {
    return null;
  }
  try {
    return importDeck(decode(window.location.hash.slice(6)));
  } catch {
    return null;
  }
}
