import type { Card, Deck, Difficulty } from "../types";
import { createId } from "../utils/id";

export const CUSTOM_DECKS_KEY = "tilted.customDecks.v1";
export const CUSTOM_DECKS_RECOVERY_KEY = "tilted.customDecks.recovery.v1";
const LEGACY_CUSTOM_DECKS_KEY = ["tilt", "frenzy.customDecks.v1"].join("");
export const MAX_CUSTOM_DECKS = 100;
export const MAX_CARDS_PER_DECK = 500;
export const MAX_IMPORT_BYTES = 500_000;
const MAX_ID_LENGTH = 160;
const MAX_DECK_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_CATEGORY_LENGTH = 100;
const MAX_PROMPT_LENGTH = 240;
const MAX_HINT_LENGTH = 500;

const difficulties: Difficulty[] = ["easy", "medium", "hard"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function cleanRequiredString(value: unknown, label: string, maxLength: number): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} cannot be blank.`);
  }

  const cleaned = value.trim();
  if (cleaned.length > maxLength) {
    throw new Error(`${label} must be ${maxLength} characters or fewer.`);
  }
  return cleaned;
}

function cleanOptionalString(value: unknown, label: string, maxLength: number): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const cleaned = value.trim();
  if (cleaned.length > maxLength) {
    throw new Error(`${label} must be ${maxLength} characters or fewer.`);
  }
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
    id: cleanOptionalString(value.id, "Card ID", MAX_ID_LENGTH) ?? createId("card"),
    prompt: cleanRequiredString(value.prompt, "Card prompt", MAX_PROMPT_LENGTH),
    answer: cleanOptionalString(value.answer, "Card hint", MAX_HINT_LENGTH),
    category: cleanOptionalString(value.category, "Card category", MAX_CATEGORY_LENGTH),
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

  if (value.cards.length > MAX_CARDS_PER_DECK) {
    throw new Error(`A deck can include up to ${MAX_CARDS_PER_DECK} cards.`);
  }

  const cards = value.cards.map(validateCard);
  if (cards.length === 0) {
    throw new Error("Add at least one card before saving a deck.");
  }
  if (new Set(cards.map(({ id }) => id)).size !== cards.length) {
    throw new Error("Every card in a deck needs a unique ID.");
  }

  return {
    id: cleanOptionalString(value.id, "Deck ID", MAX_ID_LENGTH) ?? createId("deck"),
    name: cleanRequiredString(value.name, "Deck name", MAX_DECK_NAME_LENGTH),
    description: cleanOptionalString(value.description, "Deck description", MAX_DESCRIPTION_LENGTH),
    category: cleanOptionalString(value.category, "Deck category", MAX_CATEGORY_LENGTH),
    builtIn: false,
    cards,
  };
}

function validateDecks(decks: Deck[]): Deck[] {
  if (decks.length > MAX_CUSTOM_DECKS) {
    throw new Error(`You can store up to ${MAX_CUSTOM_DECKS} custom decks in this browser.`);
  }

  const validatedDecks = decks.map(validateDeck);
  if (new Set(validatedDecks.map(({ id }) => id)).size !== validatedDecks.length) {
    throw new Error("Every custom deck needs a unique ID.");
  }
  return validatedDecks;
}

function setStoredValue(storage: Storage, key: string, value: string): void {
  try {
    storage.setItem(key, value);
  } catch {
    throw new Error("Browser storage is full. Export a backup or remove an older custom deck.");
  }
}

function preserveRecovery(storage: Storage, stored: string): void {
  try {
    storage.setItem(CUSTOM_DECKS_RECOVERY_KEY, stored);
  } catch {
    // Recovery is best-effort when browser storage is already exhausted.
  }
}

export function loadCustomDecks(storage: Storage = localStorage): Deck[] {
  const stored = storage.getItem(CUSTOM_DECKS_KEY) ?? storage.getItem(LEGACY_CUSTOM_DECKS_KEY);
  if (!stored) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      throw new Error("Saved custom decks must be an array.");
    }

    const seenIds = new Set<string>();
    let skippedDeck = false;
    const decks = parsed.flatMap((deck) => {
      try {
        const validatedDeck = validateDeck(deck);
        if (seenIds.has(validatedDeck.id) || seenIds.size >= MAX_CUSTOM_DECKS) {
          skippedDeck = true;
          return [];
        }
        seenIds.add(validatedDeck.id);
        return [validatedDeck];
      } catch {
        skippedDeck = true;
        return [];
      }
    });
    if (skippedDeck) {
      preserveRecovery(storage, stored);
    }
    setStoredValue(storage, CUSTOM_DECKS_KEY, JSON.stringify(decks));
    storage.removeItem(LEGACY_CUSTOM_DECKS_KEY);
    return decks;
  } catch {
    preserveRecovery(storage, stored);
    try {
      storage.setItem(CUSTOM_DECKS_KEY, "[]");
      storage.removeItem(LEGACY_CUSTOM_DECKS_KEY);
    } catch {
      // Keep the best-effort backup when storage cannot be rewritten.
    }
    return [];
  }
}

export function saveCustomDecks(decks: Deck[], storage: Storage = localStorage): Deck[] {
  const validatedDecks = validateDecks(decks);
  setStoredValue(storage, CUSTOM_DECKS_KEY, JSON.stringify(validatedDecks));
  return validatedDecks;
}

export function getCustomDeckRecovery(storage: Storage = localStorage): string | null {
  return storage.getItem(CUSTOM_DECKS_RECOVERY_KEY);
}

export function clearCustomDeckRecovery(storage: Storage = localStorage): void {
  storage.removeItem(CUSTOM_DECKS_RECOVERY_KEY);
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
  if (text.length > MAX_IMPORT_BYTES) {
    throw new Error("That pasted list is too large to import.");
  }

  const prompts = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (prompts.length > MAX_CARDS_PER_DECK) {
    throw new Error(`Paste up to ${MAX_CARDS_PER_DECK} cards at a time.`);
  }

  const seenPrompts = new Set<string>();
  return prompts.flatMap((prompt) => {
    const cleanedPrompt = cleanRequiredString(prompt, "Card prompt", MAX_PROMPT_LENGTH);
    const key = cleanedPrompt.toLocaleLowerCase();
    if (seenPrompts.has(key)) {
      return [];
    }
    seenPrompts.add(key);
    return [{ id: createId("card"), prompt: cleanedPrompt }];
  });
}

export function exportDeck(deck: Deck): string {
  return JSON.stringify({ ...deck, builtIn: false }, null, 2);
}

export function importDeck(json: string): Deck {
  if (json.length > MAX_IMPORT_BYTES) {
    throw new Error("That JSON deck is too large to import.");
  }

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
