import { describe, expect, it } from "vitest";
import {
  CUSTOM_DECKS_KEY,
  cardsFromLines,
  exportDeck,
  importDeck,
  loadCustomDecks,
  saveCustomDecks,
  validateDeck,
} from "./deckStorage";
import type { Deck } from "../types";

const sampleDeck: Deck = {
  id: "deck-1",
  name: "Review",
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
});
