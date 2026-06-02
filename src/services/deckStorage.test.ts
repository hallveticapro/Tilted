import { describe, expect, it } from "vitest";
import {
  CUSTOM_DECKS_KEY,
  CUSTOM_DECKS_RECOVERY_KEY,
  MAX_CARDS_PER_DECK,
  cardsFromCsv,
  cardsFromLines,
  exportDeck,
  exportDeckCsv,
  exportDeckLibrary,
  importDeck,
  importDeckLibrary,
  loadCustomDecks,
  saveCustomDecks,
  validateDeck,
} from "./deckStorage";
import type { Deck } from "../types";

const sampleDeck: Deck = {
  id: "deck-1",
  name: "Review",
  category: "Science",
  cards: [{ id: "card-1", prompt: "A push or a pull", answer: "Force" }],
};

describe("deckStorage", () => {
  it("round trips valid custom decks through local storage", () => {
    saveCustomDecks([sampleDeck]);

    expect(loadCustomDecks()).toEqual([{ ...sampleDeck, builtIn: false }]);
  });

  it("returns an empty list for malformed stored data", () => {
    localStorage.setItem(CUSTOM_DECKS_KEY, "{not-json");

    expect(loadCustomDecks()).toEqual([]);
    expect(localStorage.getItem(CUSTOM_DECKS_RECOVERY_KEY)).toBe("{not-json");
    expect(localStorage.getItem(CUSTOM_DECKS_KEY)).toBe("[]");
  });

  it("moves saved decks from the previous app namespace", () => {
    const previousKey = ["tilt", "frenzy.customDecks.v1"].join("");
    localStorage.setItem(previousKey, JSON.stringify([sampleDeck]));

    expect(loadCustomDecks()).toEqual([{ ...sampleDeck, builtIn: false }]);
    expect(localStorage.getItem(CUSTOM_DECKS_KEY)).not.toBeNull();
    expect(localStorage.getItem(previousKey)).toBeNull();
  });

  it("rejects decks with missing cards or blank prompts", () => {
    expect(() => validateDeck({ name: "No Cards", cards: [] })).toThrow(
      "Add at least one card",
    );
    expect(() => validateDeck({ name: "Blank", cards: [{ prompt: " " }] })).toThrow(
      "Every card needs a prompt",
    );
  });

  it("imports pasted prompts one non-empty line at a time", () => {
    const cards = cardsFromLines(" one \n\n two\r\nthree ");

    expect(cards.map(({ prompt }) => prompt)).toEqual(["one", "two", "three"]);
  });

  it("exports and imports full JSON decks with fresh IDs", () => {
    const imported = importDeck(exportDeck(sampleDeck));

    expect(imported.name).toBe("Review Imported");
    expect(imported.id).not.toBe(sampleDeck.id);
    expect(imported.cards[0]).toMatchObject({
      prompt: "A push or a pull",
      answer: "Force",
    });
    expect(imported.cards[0].id).not.toBe(sampleDeck.cards[0].id);
  });

  it("salvages valid stored decks and preserves the malformed payload", () => {
    localStorage.setItem(
      CUSTOM_DECKS_KEY,
      JSON.stringify([sampleDeck, { id: "bad", name: "Broken", cards: [] }]),
    );

    expect(loadCustomDecks()).toEqual([{ ...sampleDeck, builtIn: false }]);
    expect(localStorage.getItem(CUSTOM_DECKS_RECOVERY_KEY)).not.toBeNull();
  });

  it("deduplicates pasted prompts and rejects oversized decks", () => {
    const cards = cardsFromLines("One\none\nTwo");
    expect(cards.map(({ prompt }) => prompt)).toEqual(["One", "Two"]);

    expect(() =>
      validateDeck({
        name: "Too Many",
        cards: Array.from({ length: MAX_CARDS_PER_DECK + 1 }, (_, index) => ({
          id: `card-${index}`,
          prompt: `Card ${index}`,
        })),
      }),
    ).toThrow(`up to ${MAX_CARDS_PER_DECK} cards`);
  });

  it("imports and exports spreadsheet-friendly CSV cards", () => {
    const csv = exportDeckCsv(sampleDeck);
    expect(csv).toContain("prompt,hint,category,difficulty");
    expect(cardsFromCsv(csv)).toMatchObject([
      { prompt: "A push or a pull", answer: "Force" },
    ]);
  });

  it("exports and restores a whole custom-deck library with fresh IDs", () => {
    const restored = importDeckLibrary(exportDeckLibrary([sampleDeck]));
    expect(restored).toHaveLength(1);
    expect(restored[0]).toMatchObject({ name: "Review Copy", builtIn: false });
    expect(restored[0].id).not.toBe(sampleDeck.id);
    expect(restored[0].cards[0].id).not.toBe(sampleDeck.cards[0].id);
  });
});
