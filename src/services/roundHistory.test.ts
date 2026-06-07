import { describe, expect, it } from "vitest";
import {
  addRoundToHistory,
  clearRoundHistory,
  exportHistoryCsv,
  loadRoundHistory,
} from "./roundHistory";
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

  it("stores team rounds without local player or team identifiers", () => {
    const teamRound = {
      ...result,
      gameMode: "teams" as const,
      teamId: "team-1",
      teamName: "Period 3",
      playerName: "Student 1",
    };

    localStorage.setItem("tilted.roundHistory.v1", JSON.stringify([teamRound]));

    expect(loadRoundHistory()).toEqual([
      expect.not.objectContaining({
        teamId: "team-1",
        teamName: "Period 3",
        playerName: "Student 1",
      }),
    ]);
    expect(localStorage.getItem("tilted.roundHistory.v1")).not.toContain("Student 1");
    addRoundToHistory(teamRound);
    expect(localStorage.getItem("tilted.roundHistory.v1")).not.toContain("Period 3");
    expect(exportHistoryCsv([teamRound], { includeNames: true })).toContain("Student 1");
  });

  it("drops malformed stored card payloads and rewrites sanitized history", () => {
    const storedRound = {
      ...result,
      correctCards: [
        { id: "valid", prompt: "Valid prompt" },
        { id: "bad", prompt: 42 },
      ],
      passedCards: [
        { id: "passed", prompt: "Passed prompt" },
        { id: "bad-passed", prompt: null },
      ],
    };
    localStorage.setItem("tilted.roundHistory.v1", JSON.stringify([storedRound]));

    expect(loadRoundHistory()).toEqual([
      expect.objectContaining({
        correctCards: [{ id: "valid", prompt: "Valid prompt" }],
        passedCards: [{ id: "passed", prompt: "Passed prompt" }],
      }),
    ]);
    expect(localStorage.getItem("tilted.roundHistory.v1")).not.toContain("\"prompt\":42");
    expect(localStorage.getItem("tilted.roundHistory.v1")).not.toContain("\"prompt\":null");
  });

  it("drops malformed stored outcomes", () => {
    const storedRound = {
      ...result,
      outcomes: [
        { card: { id: "valid", prompt: "Valid prompt" }, outcome: "correct" },
        { card: { id: "bad-card", prompt: 42 }, outcome: "correct" },
        { card: { id: "bad-outcome", prompt: "Wrong result" }, outcome: "skip" },
      ],
    };
    localStorage.setItem("tilted.roundHistory.v1", JSON.stringify([storedRound]));

    expect(loadRoundHistory()).toEqual([
      expect.objectContaining({
        outcomes: [
          { card: { id: "valid", prompt: "Valid prompt" }, outcome: "correct" },
        ],
      }),
    ]);
    expect(localStorage.getItem("tilted.roundHistory.v1")).not.toContain("bad-card");
    expect(localStorage.getItem("tilted.roundHistory.v1")).not.toContain("bad-outcome");
  });
});
