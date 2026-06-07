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
      name: "Starter Deck Categories",
    });
    const starterDecks = screen.getByRole("region", { name: "Starter Decks" });

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

  it("restores one deleted card with Undo", () => {
    const deck: Deck = {
      id: "deck-a",
      name: "Deck A",
      cards: [
        { id: "a1", prompt: "Alpha" },
        { id: "a2", prompt: "Bravo" },
      ],
    };
    render(<DeckEditor customDecks={[deck]} onDecksChange={vi.fn()} onBack={vi.fn()} />);

    fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);

    expect(screen.getByText('Deleted "Alpha".')).toBeVisible();
    expect(screen.queryByDisplayValue("Alpha")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Undo" }));

    expect(screen.getByDisplayValue("Alpha")).toBeVisible();
    expect(screen.getByDisplayValue("Bravo")).toBeVisible();
  });

  it("restores bulk-deleted cards in their original order", () => {
    const deck: Deck = {
      id: "deck-a",
      name: "Deck A",
      cards: [
        { id: "a1", prompt: "Alpha" },
        { id: "a2", prompt: "Bravo" },
        { id: "a3", prompt: "Charlie" },
      ],
    };
    render(<DeckEditor customDecks={[deck]} onDecksChange={vi.fn()} onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("checkbox", { name: "Select Alpha" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Charlie" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete Selected" }));

    expect(screen.getByText("Deleted 2 cards.")).toBeVisible();
    expect(screen.queryByDisplayValue("Alpha")).not.toBeInTheDocument();
    expect(screen.getByDisplayValue("Bravo")).toBeVisible();
    expect(screen.queryByDisplayValue("Charlie")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Undo" }));

    const promptInputs = screen
      .getAllByDisplayValue(/Alpha|Bravo|Charlie/)
      .map((input) => (input as HTMLInputElement).value);
    expect(promptInputs).toEqual(["Alpha", "Bravo", "Charlie"]);
  });

  it("keeps at least one card when bulk delete selects every card", () => {
    const deck: Deck = {
      id: "deck-a",
      name: "Deck A",
      cards: [
        { id: "a1", prompt: "Alpha" },
        { id: "a2", prompt: "Bravo" },
      ],
    };
    render(<DeckEditor customDecks={[deck]} onDecksChange={vi.fn()} onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("checkbox", { name: "Select Alpha" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Bravo" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete Selected" }));

    expect(screen.getByText("Keep at least one card in the deck.")).toBeVisible();
    expect(screen.getByDisplayValue("Alpha")).toBeVisible();
    expect(screen.getByDisplayValue("Bravo")).toBeVisible();
  });

  it("keeps a deck intact when deck deletion is canceled", () => {
    const onDecksChange = vi.fn();
    const deck: Deck = {
      id: "deck-a",
      name: "Deck A",
      cards: [{ id: "a1", prompt: "Alpha" }],
    };
    render(<DeckEditor customDecks={[deck]} onDecksChange={onDecksChange} onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete Deck" }));
    expect(screen.getByRole("alertdialog", { name: 'Delete "Deck A"?' })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("alertdialog", { name: 'Delete "Deck A"?' })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Deck A/ })).toBeVisible();
    expect(onDecksChange).not.toHaveBeenCalled();
  });
});
