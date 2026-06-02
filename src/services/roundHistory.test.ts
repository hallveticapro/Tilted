import { describe, expect, it } from "vitest";
import { addRoundToHistory, clearRoundHistory, exportHistoryCsv, loadRoundHistory } from "./roundHistory";
import type { RoundResult } from "../types";

const result: RoundResult = { id: "round-1", completedAt: "2026-06-02T12:00:00.000Z", deckId: "deck", deckName: "Review, Deck", durationSeconds: 60, gameMode: "quick", outcomes: [], correctCards: [], passedCards: [] };

describe("roundHistory", () => {
  it("persists, exports, and clears local round history", () => {
    addRoundToHistory(result);
    expect(loadRoundHistory()).toEqual([result]);
    expect(exportHistoryCsv([result])).toContain('"Review, Deck"');
    expect(exportHistoryCsv([{ ...result, teamName: "Class 1", playerName: "Student 1" }])).not.toContain("Student 1");
    expect(exportHistoryCsv([{ ...result, teamName: "Class 1", playerName: "Student 1" }], { includeNames: true })).toContain("Student 1");
    clearRoundHistory();
    expect(loadRoundHistory()).toEqual([]);
  });
});
