import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Deck } from "../types";
import { DeckSelectScreen } from "./DeckSelectScreen";

const decks: Deck[] = [
  {
    id: "math",
    name: "Math",
    category: "Education",
    builtIn: true,
    cards: [{ id: "math-1", prompt: "Factor" }],
  },
  {
    id: "animals",
    name: "Animals",
    category: "Animals",
    builtIn: true,
    cards: [{ id: "animal-1", prompt: "Dog" }],
  },
];

describe("DeckSelectScreen", () => {
  it("opens on the first category and filters built-in decks", () => {
    const scrollBy = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollBy", {
      configurable: true,
      value: scrollBy,
    });
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      value: 100,
    });
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
      configurable: true,
      value: 500,
    });
    render(
      <DeckSelectScreen
        builtInDecks={decks}
        customDecks={[]}
        onSelect={vi.fn()}
        onBack={vi.fn()}
        onEditDecks={vi.fn()}
        favoriteDeckIds={[]}
        recentDeckIds={[]}
        onToggleFavorite={vi.fn()}
        onSelectMixed={vi.fn()}
      />,
    );

    const categoryNav = screen.getByRole("navigation", { name: "Deck Categories" });
    const builtInRegion = screen.getByRole("region", { name: "Built-In Decks" });

    fireEvent.click(screen.getByRole("button", { name: "Scroll Categories Right" }));
    expect(scrollBy).toHaveBeenCalledWith({ left: 180, behavior: "smooth" });
    expect(within(categoryNav).getByRole("button", { name: "Education" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    expect(screen.getByRole("heading", { name: "Education" })).toBeVisible();
    expect(within(builtInRegion).getByRole("button", { name: "Math" })).toBeVisible();
    expect(within(builtInRegion).queryByText(/cards/i)).not.toBeInTheDocument();
    expect(within(builtInRegion).queryByRole("button", { name: /Animals/ })).not.toBeInTheDocument();

    fireEvent.click(within(categoryNav).getByRole("button", { name: "Animals" }));
    expect(screen.getByRole("heading", { name: "Animals" })).toBeVisible();
    expect(within(builtInRegion).getByRole("button", { name: "Animals" })).toBeVisible();
    expect(within(builtInRegion).queryByRole("button", { name: /Math/ })).not.toBeInTheDocument();
  });

  it("keeps search optional and explains mixed category play", () => {
    render(
      <DeckSelectScreen
        builtInDecks={decks}
        customDecks={[]}
        onSelect={vi.fn()}
        onBack={vi.fn()}
        onEditDecks={vi.fn()}
        favoriteDeckIds={[]}
        recentDeckIds={[]}
        onToggleFavorite={vi.fn()}
        onSelectMixed={vi.fn()}
      />,
    );

    expect(screen.queryByPlaceholderText("Search Decks")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Search Decks" }));

    expect(screen.getByPlaceholderText("Search Decks")).toBeVisible();
    expect(screen.getByRole("searchbox", { name: "Search Decks" })).toBeVisible();
    expect(screen.queryByRole("group", { name: "Deck library" })).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "Show classroom-safe decks only" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close Deck Search" }));
    expect(screen.queryByPlaceholderText("Search Decks")).not.toBeInTheDocument();

    fireEvent.click(within(screen.getByRole("navigation", { name: "Deck Categories" })).getByRole("button", { name: "All" }));
    expect(screen.getByRole("button", { name: "Play Mixed Category" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Explain Play Mixed Category" })).not.toBeInTheDocument();
    expect(screen.getByText(/Mixed category combines visible built-in decks/)).toBeVisible();
  });

  it("searches all categories even when one category is selected", () => {
    render(
      <DeckSelectScreen
        builtInDecks={decks}
        customDecks={[]}
        onSelect={vi.fn()}
        onBack={vi.fn()}
        onEditDecks={vi.fn()}
        favoriteDeckIds={[]}
        recentDeckIds={[]}
        onToggleFavorite={vi.fn()}
        onSelectMixed={vi.fn()}
      />,
    );

    const categoryNav = screen.getByRole("navigation", { name: "Deck Categories" });
    const builtInRegion = screen.getByRole("region", { name: "Built-In Decks" });

    expect(within(categoryNav).getByRole("button", { name: "Education" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(within(builtInRegion).queryByRole("button", { name: "Animals" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Search Decks" }));
    fireEvent.change(screen.getByRole("searchbox", { name: "Search Decks" }), {
      target: { value: "animals" },
    });

    expect(screen.getByRole("heading", { name: "Search Results" })).toBeVisible();
    expect(within(builtInRegion).getByRole("button", { name: "Animals" })).toBeVisible();
    expect(within(builtInRegion).queryByRole("button", { name: "Math" })).not.toBeInTheDocument();
  });
});
