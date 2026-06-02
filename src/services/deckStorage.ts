import type { Card, Deck, Difficulty } from "../types";
import { createId } from "../utils/id";
import {
  getBrowserStorage,
  readStoredValue,
  removeStoredValue,
  writeStoredValue,
} from "./safeStorage";

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

function setStoredValue(storage: Storage | null, key: string, value: string): void {
  if (!writeStoredValue(storage, key, value)) {
    throw new Error("Browser storage is full. Export a backup or remove an older custom deck.");
  }
}

function preserveRecovery(storage: Storage | null, stored: string): void {
  writeStoredValue(storage, CUSTOM_DECKS_RECOVERY_KEY, stored);
}

export function loadCustomDecks(storage?: Storage): Deck[] {
  const browserStorage = getBrowserStorage(storage);
  const stored =
    readStoredValue(browserStorage, CUSTOM_DECKS_KEY) ??
    readStoredValue(browserStorage, LEGACY_CUSTOM_DECKS_KEY);
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
      preserveRecovery(browserStorage, stored);
    }
    setStoredValue(browserStorage, CUSTOM_DECKS_KEY, JSON.stringify(decks));
    removeStoredValue(browserStorage, LEGACY_CUSTOM_DECKS_KEY);
    return decks;
  } catch {
    preserveRecovery(browserStorage, stored);
    writeStoredValue(browserStorage, CUSTOM_DECKS_KEY, "[]");
    removeStoredValue(browserStorage, LEGACY_CUSTOM_DECKS_KEY);
    return [];
  }
}

export function saveCustomDecks(decks: Deck[], storage?: Storage): Deck[] {
  const validatedDecks = validateDecks(decks);
  setStoredValue(getBrowserStorage(storage), CUSTOM_DECKS_KEY, JSON.stringify(validatedDecks));
  return validatedDecks;
}

export function getCustomDeckRecovery(storage?: Storage): string | null {
  return readStoredValue(getBrowserStorage(storage), CUSTOM_DECKS_RECOVERY_KEY);
}

export function clearCustomDeckRecovery(storage?: Storage): void {
  removeStoredValue(getBrowserStorage(storage), CUSTOM_DECKS_RECOVERY_KEY);
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

export function exportDeckLibrary(decks: Deck[]): string {
  return JSON.stringify(validateDecks(decks), null, 2);
}

export function importDeckLibrary(json: string): Deck[] {
  if (json.length > MAX_IMPORT_BYTES) {
    throw new Error("That JSON library is too large to import.");
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("That JSON library could not be parsed.");
  }
  if (!Array.isArray(parsed)) {
    throw new Error("A deck-library backup needs to be an array.");
  }
  return validateDecks(parsed.map((deck) => copyDeck(validateDeck(deck))));
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") {
        index += 1;
      }
      row.push(cell);
      if (row.some((value) => value.trim())) {
        rows.push(row);
      }
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }
  if (quoted) {
    throw new Error("That CSV has an unfinished quoted value.");
  }
  row.push(cell);
  if (row.some((value) => value.trim())) {
    rows.push(row);
  }
  return rows;
}

function escapeCsv(value = ""): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function exportDeckCsv(deck: Deck): string {
  return [
    ["prompt", "hint", "category", "difficulty"],
    ...deck.cards.map((card) => [
      card.prompt,
      card.answer ?? "",
      card.category ?? "",
      card.difficulty ?? "",
    ]),
  ]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");
}

export function cardsFromCsv(text: string): Card[] {
  if (text.length > MAX_IMPORT_BYTES) {
    throw new Error("That CSV is too large to import.");
  }
  const rows = parseCsvRows(text);
  const hasHeader = rows[0]?.[0].trim().toLocaleLowerCase() === "prompt";
  const cards = (hasHeader ? rows.slice(1) : rows).map(([prompt, answer, category, difficulty]) =>
    validateCard({ prompt, answer, category, difficulty: difficulty || undefined }),
  );
  if (cards.length > MAX_CARDS_PER_DECK) {
    throw new Error(`Import up to ${MAX_CARDS_PER_DECK} cards at a time.`);
  }
  return cards;
}
