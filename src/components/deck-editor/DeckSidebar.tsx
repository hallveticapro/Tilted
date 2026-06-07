import type { Deck } from "../../types";
import { CategoryScroller } from "../CategoryScroller";

interface DeckSidebarProps {
  allCategories: string;
  workingDecks: Deck[];
  selectedDeckId: string;
  seedCategories: string[];
  seedCategory: string;
  visibleSeedDecks: Deck[];
  onAddDeck: () => void;
  onCopyDeck: (deck: Deck) => void;
  onExportLibrary: () => void;
  onSelectDeck: (deckId: string) => void;
  onSelectSeedCategory: (category: string) => void;
}

export function DeckSidebar({
  allCategories,
  workingDecks,
  selectedDeckId,
  seedCategories,
  seedCategory,
  visibleSeedDecks,
  onAddDeck,
  onCopyDeck,
  onExportLibrary,
  onSelectDeck,
  onSelectSeedCategory,
}: DeckSidebarProps) {
  return (
    <aside className="editor-sidebar panel">
      <div className="section-heading">
        <h2>Your Decks</h2>
        <button className="button button--small button--primary" type="button" onClick={onAddDeck}>
          New
        </button>
      </div>
      <button
        className="button button--small button--secondary editor-library-export"
        type="button"
        onClick={onExportLibrary}
      >
        Export Library
      </button>
      {workingDecks.length === 0 && <p className="muted">Create a deck or copy a starter.</p>}
      {workingDecks.map((deck) => (
        <button
          className={`editor-deck-link ${selectedDeckId === deck.id ? "is-selected" : ""}`}
          key={deck.id}
          type="button"
          onClick={() => onSelectDeck(deck.id)}
        >
          {deck.name}
          <small>{deck.cards.length} cards</small>
        </button>
      ))}
      <h3>Copy a Starter</h3>
      <CategoryScroller
        ariaLabel="Starter Deck Categories"
        categories={[allCategories, ...seedCategories]}
        selectedCategory={seedCategory}
        onSelect={onSelectSeedCategory}
        compact
      />
      <section className="starter-decks" aria-label="Starter Decks">
        <p className="muted starter-decks__count">
          {visibleSeedDecks.length} {visibleSeedDecks.length === 1 ? "deck" : "decks"}
        </p>
        {visibleSeedDecks.map((deck) => (
          <button className="editor-deck-link" key={deck.id} type="button" onClick={() => onCopyDeck(deck)}>
            {deck.name}
            <small>Make Editable Copy</small>
          </button>
        ))}
      </section>
    </aside>
  );
}
