import type { RoundResult } from "../types";
import { getBrowserStorage, readStoredValue, removeStoredValue, writeStoredValue } from "./safeStorage";

export const ROUND_HISTORY_KEY = "tilted.roundHistory.v1";
const MAX_HISTORY_ITEMS = 100;

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
  const stored = readStoredValue(getBrowserStorage(storage), ROUND_HISTORY_KEY);
  if (!stored) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter(isRoundResult).slice(0, MAX_HISTORY_ITEMS) : [];
  } catch {
    return [];
  }
}

export function saveRoundHistory(history: RoundResult[], storage?: Storage): RoundResult[] {
  const trimmed = history.slice(0, MAX_HISTORY_ITEMS);
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
