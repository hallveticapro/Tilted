import type { Deck } from "../types";
import { exportDeck, importDeck } from "./deckStorage";

export type SharedDeckReadResult =
  | { status: "none" }
  | { status: "ok"; deck: Deck }
  | { status: "error"; message: string };

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

export function readSharedDeckFromLocation(): SharedDeckReadResult {
  if (!window.location.hash.startsWith("#deck=")) {
    return { status: "none" };
  }
  let json: string;
  try {
    json = decode(window.location.hash.slice(6));
  } catch {
    return {
      status: "error",
      message: "That shared deck link could not be read.",
    };
  }
  try {
    return { status: "ok", deck: importDeck(json) };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error
        ? error.message
        : "That shared deck link could not be read.",
    };
  }
}
