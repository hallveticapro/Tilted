import type { Card, Deck, Difficulty } from "../types";
import { createId } from "../utils/id";

export const CUSTOM_DECKS_KEY = "tiltfrenzy.customDecks.v1";

const difficulties: Difficulty[] = ["easy", "medium", "hard"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function cleanOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : undefined;
}

export function validateCard(value: unknown): Card {
  if (!isRecord(value) || typeof value.prompt !== "string" || value.prompt.trim() === "") {
    throw new Error("Every card needs a prompt.");
  }

  if (
    value.difficulty !== undefined &&
    !difficulties.includes(value.difficulty as Difficulty)
  ) {
    throw new Error("Card difficulty must be easy, medium, or hard.");
  }

  return {
    id: cleanOptionalString(value.id) ?? createId("card"),
    prompt: value.prompt.trim(),
    answer: cleanOptionalString(value.answer),
    category: cleanOptionalString(value.category),
    difficulty: value.difficulty as Difficulty | undefined,
  };
}

export function validateDeck(value: unknown): Deck {
  if (!isRecord(value) || typeof value.name !== "string" || value.name.trim() === "") {
    throw new Error("Every deck needs a name.");
  }

  if (!Array.isArray(value.cards)) {
    throw new Error("A deck needs a cards array.");
  }

  const cards = value.cards.map(validateCard);
  if (cards.length === 0) {
    throw new Error("Add at least one card before saving a deck.");
  }

  return {
    id: cleanOptionalString(value.id) ?? createId("deck"),
    name: value.name.trim(),
    description: cleanOptionalString(value.description),
    builtIn: false,
    cards,
  };
}

export function loadCustomDecks(storage: Storage = localStorage): Deck[] {
  const stored = storage.getItem(CUSTOM_DECKS_KEY);
  if (!stored) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.map(validateDeck) : [];
  } catch {
    return [];
  }
}

export function saveCustomDecks(decks: Deck[], storage: Storage = localStorage): Deck[] {
  const validatedDecks = decks.map(validateDeck);
  storage.setItem(CUSTOM_DECKS_KEY, JSON.stringify(validatedDecks));
  return validatedDecks;
}

export function createDeck(name = "New Deck"): Deck {
  return {
    id: createId("deck"),
    name,
    builtIn: false,
    cards: [
      {
        id: createId("card"),
        prompt: "Your first card",
      },
    ],
  };
}

export function copyDeck(deck: Deck): Deck {
  return {
    ...deck,
    id: createId("deck"),
    name: `${deck.name} Copy`,
    builtIn: false,
    cards: deck.cards.map((card) => ({ ...card, id: createId("card") })),
  };
}

export function cardsFromLines(text: string): Card[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((prompt) => ({ id: createId("card"), prompt }));
}

export function exportDeck(deck: Deck): string {
  return JSON.stringify({ ...deck, builtIn: false }, null, 2);
}

export function importDeck(json: string): Deck {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("That JSON could not be parsed.");
  }

  const deck = validateDeck(parsed);
  return {
    ...deck,
    id: createId("deck"),
    name: `${deck.name} Imported`,
    cards: deck.cards.map((card) => ({ ...card, id: createId("card") })),
  };
}
