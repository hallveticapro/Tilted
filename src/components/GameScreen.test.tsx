import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { playOutcomeSound } from "../services/audio";
import type { Deck, RoundSettings } from "../types";
import { GameScreen, shuffleCards } from "./GameScreen";

vi.mock("../services/audio", () => ({
  playOutcomeSound: vi.fn(),
}));

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
  beforeEach(() => {
    vi.mocked(playOutcomeSound).mockClear();
  });

  it("creates a fresh randomized card order for every round", () => {
    const cards = [
      { id: "one", prompt: "One" },
      { id: "two", prompt: "Two" },
      { id: "three", prompt: "Three" },
      { id: "four", prompt: "Four" },
    ];
    const random = vi
      .spyOn(Math, "random")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.99)
      .mockReturnValueOnce(0.99)
      .mockReturnValueOnce(0.99);

    expect(shuffleCards(cards).map(({ id }) => id)).toEqual(["two", "three", "four", "one"]);
    expect(shuffleCards(cards).map(({ id }) => id)).toEqual(["one", "two", "three", "four"]);
    expect(cards.map(({ id }) => id)).toEqual(["one", "two", "three", "four"]);

    random.mockRestore();
  });

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
        onQuit={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /correct/i }));
    expect(screen.getByRole("status")).toHaveTextContent("Correct!");
    expect(screen.getByRole("status")).toHaveClass("feedback-flash--correct");
    expect(playOutcomeSound).toHaveBeenCalledWith("correct");
    act(() => vi.advanceTimersByTime(500));

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
        onQuit={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /reveal hint/i }));
    expect(screen.getByText(/hint:/i)).toHaveTextContent("Force");
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByRole("status")).toHaveTextContent("Pass");
    expect(screen.getByRole("status")).toHaveClass("feedback-flash--pass");
    expect(playOutcomeSound).toHaveBeenCalledWith("pass");
    act(() => vi.advanceTimersByTime(500));

    expect(onRoundEnd.mock.calls[0][0].passedCards).toEqual([deck.cards[0]]);
    vi.useRealTimers();
  });

  it("hides fallback buttons for active motion until the menu is opened", () => {
    render(
      <GameScreen
        deck={deck}
        settings={{ ...settings, motionEnabled: true }}
        motionStatus="calibrated"
        motionAction={null}
        onRoundEnd={vi.fn()}
        onQuit={vi.fn()}
      />,
    );

    expect(screen.queryByRole("region", { name: "Card actions" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show controls" }));
    expect(screen.getByRole("region", { name: "Card actions" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Hide controls" }));
    expect(screen.queryByRole("region", { name: "Card actions" })).not.toBeInTheDocument();
  });

  it("shows a quit option inside the compact paused card", () => {
    const onQuit = vi.fn();
    render(
      <GameScreen
        deck={deck}
        settings={settings}
        motionStatus="off"
        motionAction={null}
        onRoundEnd={vi.fn()}
        onQuit={onQuit}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(screen.getByText("Round paused")).toBeVisible();
    expect(screen.queryByRole("region", { name: "Card actions" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Quit Round" }));
    expect(onQuit).toHaveBeenCalledTimes(1);
  });

  it("scales extra-long custom prompts down to stay inside the card", () => {
    render(
      <GameScreen
        deck={{
          id: "long-prompt",
          name: "Custom",
          cards: [
            {
              id: "long-card",
              prompt:
                "Describe this intentionally very long custom prompt without letting the card overflow the viewport",
            },
          ],
        }}
        settings={settings}
        motionStatus="off"
        motionAction={null}
        onRoundEnd={vi.fn()}
        onQuit={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading")).toHaveClass("game-card__prompt--extra-long");
  });
});
