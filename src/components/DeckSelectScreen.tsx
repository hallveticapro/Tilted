import { useMemo, useState } from "react";
import type { Deck } from "../types";
import { CategoryScroller } from "./CategoryScroller";
import { ScreenLayout } from "./ScreenLayout";

interface DeckSelectScreenProps {
  builtInDecks: Deck[];
  customDecks: Deck[];
  onSelect: (deckId: string) => void;
  onBack: () => void;
  onEditDecks: () => void;
}

function DeckCard({ deck, onSelect }: { deck: Deck; onSelect: (id: string) => void }) {
  return (
    <button className="deck-card" type="button" onClick={() => onSelect(deck.id)}>
      <span className="deck-card__type">{deck.builtIn ? deck.category ?? "Built-in deck" : "Custom deck"}</span>
      <strong>{deck.name}</strong>
      <span>{deck.description ?? `${deck.cards.length} cards ready to play.`}</span>
      <small>{deck.cards.length} cards</small>
    </button>
  );
}

const ALL_CATEGORIES = "All";

export function DeckSelectScreen({
  builtInDecks,
  customDecks,
  onSelect,
  onBack,
  onEditDecks,
}: DeckSelectScreenProps) {
  const categories = useMemo(
    () =>
      Array.from(
        new Set(builtInDecks.map((deck) => deck.category).filter((category): category is string => Boolean(category))),
      ),
    [builtInDecks],
  );
  const [selectedCategory, setSelectedCategory] = useState(() => categories[0] ?? ALL_CATEGORIES);
  const visibleBuiltInDecks =
    selectedCategory === ALL_CATEGORIES
      ? builtInDecks
      : builtInDecks.filter((deck) => deck.category === selectedCategory);

  return (
    <ScreenLayout
      title="Choose a Deck"
      eyebrow="Pick your challenge"
      actions={
        <button className="button button--ghost" type="button" onClick={onBack}>
          Home
        </button>
      }
    >
      <CategoryScroller
        ariaLabel="Deck categories"
        categories={[ALL_CATEGORIES, ...categories]}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />
      <div className="section-heading">
        <h2>{selectedCategory === ALL_CATEGORIES ? "All built-in decks" : selectedCategory}</h2>
        <span className="muted">{visibleBuiltInDecks.length} decks</span>
      </div>
      <section className="deck-grid" aria-label="Built-in decks">
        {visibleBuiltInDecks.map((deck) => (
          <DeckCard key={deck.id} deck={deck} onSelect={onSelect} />
        ))}
      </section>
      <div className="section-heading">
        <h2>Your decks</h2>
        <button className="button button--small button--secondary" type="button" onClick={onEditDecks}>
          Manage decks
        </button>
      </div>
      {customDecks.length > 0 ? (
        <section className="deck-grid" aria-label="Custom decks">
          {customDecks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} onSelect={onSelect} />
          ))}
        </section>
      ) : (
        <p className="empty-state">No custom decks yet. Create one for your next review.</p>
      )}
    </ScreenLayout>
  );
}
