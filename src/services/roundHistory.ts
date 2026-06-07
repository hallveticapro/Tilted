import type { Card, RoundCardResult, RoundResult } from "../types";
import { getBrowserStorage, readStoredValue, removeStoredValue, writeStoredValue } from "./safeStorage";

export const ROUND_HISTORY_KEY = "tilted.roundHistory.v1";
const MAX_HISTORY_ITEMS = 100;

function isStoredCard(value: unknown): value is Card {
  if (!value || typeof value !== "object") {
    return false;
  }
  const card = value as Partial<Card>;
  return (
    typeof card.id === "string" &&
    typeof card.prompt === "string" &&
    (card.answer === undefined || typeof card.answer === "string") &&
    (card.category === undefined || typeof card.category === "string") &&
    (card.difficulty === undefined ||
      card.difficulty === "easy" ||
      card.difficulty === "medium" ||
      card.difficulty === "hard")
  );
}

function sanitizeCards(values: unknown[]): Card[] {
  return values.filter(isStoredCard);
}

function isStoredOutcome(value: unknown): value is RoundCardResult {
  if (!value || typeof value !== "object") {
    return false;
  }
  const result = value as Partial<RoundCardResult>;
  return (
    (result.outcome === "correct" || result.outcome === "pass") &&
    isStoredCard(result.card)
  );
}

function sanitizeOutcomes(values: unknown[]): RoundCardResult[] {
  return values.filter(isStoredOutcome);
}

function isRoundResult(value: unknown): value is RoundResult {
  if (!value || typeof value !== "object") {
    return false;
  }
  const result = value as Partial<RoundResult>;
  return (
    typeof result.id === "string" &&
    typeof result.completedAt === "string" &&
    typeof result.deckId === "string" &&
    typeof result.deckName === "string" &&
    typeof result.durationSeconds === "number" &&
    (result.gameMode === "quick" || result.gameMode === "teams") &&
    Array.isArray(result.outcomes) &&
    Array.isArray(result.correctCards) &&
    Array.isArray(result.passedCards)
  );
}

export function loadRoundHistory(storage?: Storage): RoundResult[] {
  const browserStorage = getBrowserStorage(storage);
  const stored = readStoredValue(browserStorage, ROUND_HISTORY_KEY);
  if (!stored) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const history = parsed.filter(isRoundResult).map(sanitizeRoundForHistory).slice(0, MAX_HISTORY_ITEMS);
    const serializedHistory = JSON.stringify(history);
    if (serializedHistory !== stored) {
      writeStoredValue(browserStorage, ROUND_HISTORY_KEY, serializedHistory);
    }
    return history;
  } catch {
    return [];
  }
}

export function sanitizeRoundForHistory(result: RoundResult): RoundResult {
  const { teamId: _teamId, teamName: _teamName, playerName: _playerName, ...anonymousResult } = result;
  return {
    ...anonymousResult,
    outcomes: sanitizeOutcomes(result.outcomes),
    correctCards: sanitizeCards(result.correctCards),
    passedCards: sanitizeCards(result.passedCards),
  };
}

export function saveRoundHistory(history: RoundResult[], storage?: Storage): RoundResult[] {
  const trimmed = history.map(sanitizeRoundForHistory).slice(0, MAX_HISTORY_ITEMS);
  writeStoredValue(getBrowserStorage(storage), ROUND_HISTORY_KEY, JSON.stringify(trimmed));
  return trimmed;
}

export function addRoundToHistory(result: RoundResult, storage?: Storage): RoundResult[] {
  return saveRoundHistory([result, ...loadRoundHistory(storage)], storage);
}

export function clearRoundHistory(storage?: Storage): void {
  removeStoredValue(getBrowserStorage(storage), ROUND_HISTORY_KEY);
}

function escapeCsv(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function exportHistoryCsv(
  history: RoundResult[],
  { includeNames = false }: { includeNames?: boolean } = {},
): string {
  const columns = includeNames
    ? ["completed_at", "mode", "team", "player", "deck", "duration_seconds", "correct", "passed"]
    : ["completed_at", "mode", "deck", "duration_seconds", "correct", "passed"];
  return [
    columns,
    ...history.map((result) =>
      includeNames
        ? [
            result.completedAt,
            result.gameMode,
            result.teamName ?? "",
            result.playerName ?? "",
            result.deckName,
            result.durationSeconds,
            result.correctCards.length,
            result.passedCards.length,
          ]
        : [
            result.completedAt,
            result.gameMode,
            result.deckName,
            result.durationSeconds,
            result.correctCards.length,
            result.passedCards.length,
          ],
    ),
  ]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");
}

export function getBestScore(history: RoundResult[], deckId: string): number {
  return history.reduce(
    (best, result) =>
      result.deckId === deckId ? Math.max(best, result.correctCards.length) : best,
    0,
  );
}
