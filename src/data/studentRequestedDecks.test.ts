import { describe, expect, it } from "vitest";
import { studentRequestedDecks } from "./studentRequestedDecks";
import { cardsFromCsv, copyDeck, exportDeckCsv, exportDeck, importDeck, validateCard } from "../services/deckStorage";

describe("student requested decks", () => {
  it("includes Harry Potter and focused K-pop decks with KATSEYE", () => {
    const [potter, clues, names, bands] = studentRequestedDecks;
    expect(potter.cards).toHaveLength(50);
    expect(bands.cards.map(({ prompt }) => prompt)).toContain("KATSEYE");
    expect(clues.cards.some(({ category }) => category === "KATSEYE")).toBe(true);
    expect(clues.cards.every(({ clue }) => Boolean(clue))).toBe(true);
    expect(names.cards.every(({ clue }) => clue === undefined)).toBe(true);
    expect(names.cards.map(({ prompt }) => prompt)).toEqual(clues.cards.map(({ prompt }) => prompt));
    for (const deck of studentRequestedDecks) {
      expect(new Set(deck.cards.map(({ prompt }) => prompt)).size).toBe(deck.cards.length);
    }
  });

  it("preserves visible clues in copies, JSON imports and CSV round trips", () => {
    const deck = studentRequestedDecks[1];
    expect(copyDeck(deck).cards[0].clue).toBe(deck.cards[0].clue);
    expect(importDeck(exportDeck(deck)).cards[0].clue).toBe(deck.cards[0].clue);
    expect(cardsFromCsv(exportDeckCsv(deck))[0].clue).toBe(deck.cards[0].clue);
    expect(() => validateCard({ prompt: "Title", clue: "x".repeat(501) })).toThrow("Card clue");
  });
});
