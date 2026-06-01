import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Deck, RoundSettings } from "../types";
import { GameScreen } from "./GameScreen";

const deck: Deck = {
  id: "test-deck",
  name: "Tiny Deck",
  cards: [{ id: "only-card", prompt: "A push or pull", answer: "Force" }],
};

const settings: RoundSettings = {
  deckId: deck.id,
  durationSeconds: 30,
  motionEnabled: false,
  reverseTilt: false,
  tiltThreshold: 25,
};

describe("GameScreen", () => {
  it("records a correct card and completes a one-card round", () => {
    vi.useFakeTimers();
    const onRoundEnd = vi.fn();
    render(
      <GameScreen
        deck={deck}
        settings={settings}
        motionStatus="off"
        motionAction={null}
        onRoundEnd={onRoundEnd}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /correct/i }));
    act(() => vi.advanceTimersByTime(250));

    expect(onRoundEnd).toHaveBeenCalledTimes(1);
    expect(onRoundEnd.mock.calls[0][0].correctCards).toEqual([deck.cards[0]]);
    expect(onRoundEnd.mock.calls[0][0].passedCards).toEqual([]);
    vi.useRealTimers();
  });

  it("supports keyboard shortcuts and answer reveal", () => {
    vi.useFakeTimers();
    const onRoundEnd = vi.fn();
    render(
      <GameScreen
        deck={deck}
        settings={settings}
        motionStatus="off"
        motionAction={null}
        onRoundEnd={onRoundEnd}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /reveal answer/i }));
    expect(screen.getByText(/answer:/i)).toHaveTextContent("Force");
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    act(() => vi.advanceTimersByTime(250));

    expect(onRoundEnd.mock.calls[0][0].passedCards).toEqual([deck.cards[0]]);
    vi.useRealTimers();
  });
});
