import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState, type ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import type { Deck } from "../types";
import { DeckSelectScreen } from "./DeckSelectScreen";

const decks: Deck[] = [
  {
    id: "math",
    name: "Math",
    category: "Education",
    builtIn: true,
    classroomSafe: true,
    subject: "Mathematics",
    ageRange: "Grade 4",
    tags: ["fractions"],
    cards: [{ id: "math-1", prompt: "Factor" }],
  },
  {
    id: "movies",
    name: "Movies",
    category: "Entertainment",
    builtIn: true,
    classroomSafe: false,
    cards: [{ id: "movie-1", prompt: "Space musical" }],
  },
  {
    id: "animals",
    name: "Animals",
    category: "Animals",
    builtIn: true,
    classroomSafe: true,
    subject: "Science",
    ageRange: "Grade 3",
    cards: [{ id: "animal-1", prompt: "Dog" }],
  },
];

function renderDeckSelect(
  overrides: Partial<ComponentProps<typeof DeckSelectScreen>> = {},
) {
  const props: ComponentProps<typeof DeckSelectScreen> = {
    builtInDecks: decks,
    customDecks: [],
    onSelect: vi.fn(),
    onBack: vi.fn(),
    onEditDecks: vi.fn(),
    favoriteDeckIds: [],
    classroomOnly: false,
    recentDeckIds: [],
    onClassroomOnlyChange: vi.fn(),
    onToggleFavorite: vi.fn(),
    onSelectMixed: vi.fn(),
    ...overrides,
  };

  render(<DeckSelectScreen {...props} />);
  return props;
}

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
    renderDeckSelect();

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
    renderDeckSelect();

    expect(screen.queryByPlaceholderText("Search Decks")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Search Decks" }));

    expect(screen.getByPlaceholderText("Search Decks")).toBeVisible();
    expect(screen.getByRole("searchbox", { name: "Search Decks" })).toBeVisible();
    expect(screen.queryByRole("group", { name: "Deck library" })).not.toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Classroom-safe decks only" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Close Deck Search" }));
    expect(screen.queryByPlaceholderText("Search Decks")).not.toBeInTheDocument();

    fireEvent.click(within(screen.getByRole("navigation", { name: "Deck Categories" })).getByRole("button", { name: "All" }));
    expect(screen.getByRole("button", { name: "Play Mixed Category" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Explain Play Mixed Category" })).not.toBeInTheDocument();
    expect(screen.getByText(/Mixed category combines visible built-in decks/)).toBeVisible();
  });

  it("searches all categories even when one category is selected", () => {
    renderDeckSelect();

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

  it("hides unsafe built-in decks while keeping custom decks visible", () => {
    const customDeck: Deck = {
      id: "custom-party",
      name: "Custom Party Review",
      cards: [{ id: "custom-1", prompt: "Local clue" }],
    };
    renderDeckSelect({ classroomOnly: true, customDecks: [customDeck] });

    const builtInRegion = screen.getByRole("region", { name: "Built-In Decks" });
    const customRegion = screen.getByRole("region", { name: "Custom Decks" });

    expect(within(builtInRegion).getByRole("button", { name: "Math" })).toBeVisible();
    expect(within(builtInRegion).queryByRole("button", { name: "Movies" })).not.toBeInTheDocument();
    expect(within(customRegion).getByRole("button", { name: "Custom Party Review" })).toBeVisible();
  });

  it("enables classroom-safe filtering from the toggle", () => {
    function StatefulDeckSelect() {
      const [classroomOnly, setClassroomOnly] = useState(false);

      return (
        <DeckSelectScreen
          builtInDecks={decks}
          customDecks={[]}
          onSelect={vi.fn()}
          onBack={vi.fn()}
          onEditDecks={vi.fn()}
          favoriteDeckIds={[]}
          classroomOnly={classroomOnly}
          recentDeckIds={[]}
          onClassroomOnlyChange={setClassroomOnly}
          onToggleFavorite={vi.fn()}
          onSelectMixed={vi.fn()}
        />
      );
    }

    render(<StatefulDeckSelect />);

    fireEvent.click(within(screen.getByRole("navigation", { name: "Deck Categories" })).getByRole("button", { name: "All" }));
    expect(screen.getByRole("button", { name: "Movies" })).toBeVisible();

    fireEvent.click(screen.getByRole("checkbox", { name: "Classroom-safe decks only" }));

    expect(screen.queryByRole("button", { name: "Movies" })).not.toBeInTheDocument();
  });

  it("limits mixed category choices to classroom-safe built-in decks when enabled", () => {
    const onSelectMixed = vi.fn();
    renderDeckSelect({ classroomOnly: true, onSelectMixed });

    fireEvent.click(within(screen.getByRole("navigation", { name: "Deck Categories" })).getByRole("button", { name: "All" }));
    fireEvent.click(screen.getByRole("button", { name: "Play Mixed Category" }));

    expect(onSelectMixed).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: "math" }),
        expect.objectContaining({ id: "animals" }),
      ]),
      "All",
    );
    expect(onSelectMixed.mock.calls[0][0]).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "movies" })]),
    );
  });

  it("does not choose unsafe built-in decks with Surprise Me when classroom-safe is enabled", () => {
    const onSelect = vi.fn();
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.99);
    renderDeckSelect({ classroomOnly: true, onSelect });

    fireEvent.click(within(screen.getByRole("navigation", { name: "Deck Categories" })).getByRole("button", { name: "All" }));
    fireEvent.click(screen.getByRole("button", { name: "Surprise Me" }));

    expect(onSelect).toHaveBeenCalledWith("animals");
    expect(onSelect).not.toHaveBeenCalledWith("movies");
    randomSpy.mockRestore();
  });

  it("notifies callers when the classroom-safe toggle changes", () => {
    const onClassroomOnlyChange = vi.fn();
    renderDeckSelect({ onClassroomOnlyChange });

    fireEvent.click(screen.getByRole("checkbox", { name: "Classroom-safe decks only" }));

    expect(onClassroomOnlyChange).toHaveBeenCalledWith(true);
  });

  it("searches deck metadata", () => {
    renderDeckSelect();

    fireEvent.click(screen.getByRole("button", { name: "Search Decks" }));
    fireEvent.change(screen.getByRole("searchbox", { name: "Search Decks" }), {
      target: { value: "mathematics" },
    });

    const builtInRegion = screen.getByRole("region", { name: "Built-In Decks" });
    expect(within(builtInRegion).getByRole("button", { name: "Math" })).toBeVisible();
    expect(within(builtInRegion).queryByRole("button", { name: "Animals" })).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("searchbox", { name: "Search Decks" }), {
      target: { value: "grade 3" },
    });

    expect(within(builtInRegion).getByRole("button", { name: "Animals" })).toBeVisible();
    expect(within(builtInRegion).queryByRole("button", { name: "Math" })).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("searchbox", { name: "Search Decks" }), {
      target: { value: "fractions" },
    });

    expect(within(builtInRegion).getByRole("button", { name: "Math" })).toBeVisible();
  });

  it("shows compact metadata labels on educational deck cards", () => {
    renderDeckSelect();

    const mathCard = screen.getByRole("button", { name: "Math" });

    expect(within(mathCard).getByText("Mathematics")).toBeVisible();
    expect(within(mathCard).getByText("Grade 4")).toBeVisible();
    expect(within(mathCard).getByText("Classroom safe")).toBeVisible();
  });
});
