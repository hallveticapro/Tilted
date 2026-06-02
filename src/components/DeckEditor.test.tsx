import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DeckEditor } from "./DeckEditor";

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
});
