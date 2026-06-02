import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DeckEditor } from "./DeckEditor";
import type { Deck } from "../types";

describe("DeckEditor", () => {
  it("filters the built-in starter list by category", () => {
    render(
      <DeckEditor customDecks={[]} onDecksChange={vi.fn()} onBack={vi.fn()} />,
    );

    const categoryNav = screen.getByRole("navigation", {
      name: "Starter deck categories",
    });
    const starterDecks = screen.getByRole("region", { name: "Starter decks" });

    expect(within(starterDecks).getByRole("button", { name: /4th Grade Math Review/ })).toBeVisible();
    expect(within(starterDecks).queryByRole("button", { name: /Common Animals/ })).not.toBeInTheDocument();

    fireEvent.click(within(categoryNav).getByRole("button", { name: "Animals" }));

    expect(within(starterDecks).getByRole("button", { name: /Common Animals/ })).toBeVisible();
    expect(within(starterDecks).queryByRole("button", { name: /4th Grade Math Review/ })).not.toBeInTheDocument();
  });

  it("does not leave the editor when a deferred prompt edit is invalid", () => {
    vi.useFakeTimers();
    const onBack = vi.fn();
    const deck: Deck = { id: "deck-a", name: "A", cards: [{ id: "card-a", prompt: "Keep me" }] };
    render(<DeckEditor customDecks={[deck]} onDecksChange={vi.fn()} onBack={onBack} />);

    fireEvent.change(screen.getByDisplayValue("Keep me"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    expect(onBack).not.toHaveBeenCalled();
    expect(screen.getByText(/Every card needs a prompt/)).toBeVisible();
    vi.useRealTimers();
  });

  it("does not restore a deleted card into a different deck", () => {
    const onDecksChange = vi.fn();
    const decks: Deck[] = [
      { id: "deck-a", name: "Deck A", cards: [{ id: "a1", prompt: "Alpha" }, { id: "a2", prompt: "Able" }] },
      { id: "deck-b", name: "Deck B", cards: [{ id: "b1", prompt: "Beta" }] },
    ];
    render(<DeckEditor customDecks={decks} onDecksChange={onDecksChange} onBack={vi.fn()} />);

    fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Deck B1 cards" }));
    expect(screen.queryByRole("button", { name: "Undo" })).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue("Alpha")).not.toBeInTheDocument();
  });
});
