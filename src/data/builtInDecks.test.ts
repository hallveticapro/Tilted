import { describe, expect, it } from "vitest";
import { builtInDecks } from "./builtInDecks";
import { expandedDeckSeeds } from "./expandedDeckSeeds";

describe("builtInDecks", () => {
  it("uses visible target words instead of hidden flashcard answers", () => {
    const mathDeck = builtInDecks.find(({ id }) => id === "math-review");
    const scienceDeck = builtInDecks.find(({ id }) => id === "science-review");

    expect(mathDeck?.cards.map(({ prompt }) => prompt)).toContain("Factor");
    expect(scienceDeck?.cards.map(({ prompt }) => prompt)).toContain("Matter");
    expect(builtInDecks.flatMap(({ cards }) => cards).every(({ answer }) => answer === undefined)).toBe(
      true,
    );
  });

  it("ships a categorized library with at least 50 new decks", () => {
    const categories = new Set(builtInDecks.map(({ category }) => category));
    const ids = builtInDecks.map(({ id }) => id);
    const cardIds = builtInDecks.flatMap(({ cards }) => cards.map(({ id }) => id));
    const requiredDeckNames = [
      "Disney Characters",
      "Disney Movies",
      "Disney Songs",
      "Disney Park Rides",
      "Marvel Characters",
      "Star Wars Characters",
      "Common Animals",
      "Common Foods",
      "Popular Actors",
      "Popular Music Artists",
    ];

    expect(expandedDeckSeeds.length).toBeGreaterThanOrEqual(50);
    expect(builtInDecks.length).toBeGreaterThanOrEqual(expandedDeckSeeds.length + 4);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(cardIds).size).toBe(cardIds.length);
    expect(categories).toEqual(
      new Set([
        "Education",
        "Animals",
        "Food & Everyday",
        "Disney",
        "Theme Parks",
        "Movies & TV",
        "Music",
        "Heroes & Sci-Fi",
        "Sports & Games",
        "Places & Travel",
        "Just for Fun",
      ]),
    );
    expect(requiredDeckNames.every((name) => builtInDecks.some((deck) => deck.name === name))).toBe(
      true,
    );
    expect(builtInDecks.every(({ category, cards }) => Boolean(category) && cards.length >= 50)).toBe(
      true,
    );
    expect(builtInDecks.find(({ id }) => id === "us-states")?.description).toContain("U.S. states");
  });
});
