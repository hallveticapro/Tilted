import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { RoundResult } from "../types";
import { HistoryScreen } from "./HistoryScreen";

const round: RoundResult = {
  id: "round-1",
  completedAt: "2026-06-07T12:00:00.000Z",
  deckId: "deck",
  deckName: "Review Deck",
  durationSeconds: 60,
  gameMode: "quick",
  outcomes: [],
  correctCards: [{ id: "card-1", prompt: "Alpha" }],
  passedCards: [],
};

describe("HistoryScreen", () => {
  it("keeps history intact when clear history is canceled", () => {
    const onClear = vi.fn();
    render(<HistoryScreen history={[round]} onClear={onClear} onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Clear history" }));
    expect(screen.getByRole("alertdialog", { name: "Clear all round history?" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("alertdialog", { name: "Clear all round history?" })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Round history" })).toBeVisible();
    expect(screen.getByText("Review Deck")).toBeVisible();
    expect(onClear).not.toHaveBeenCalled();
  });
});
