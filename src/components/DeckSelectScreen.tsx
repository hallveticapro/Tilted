import { useEffect, useMemo, useRef, useState } from "react";
import type { Deck } from "../types";
import { CategoryScroller } from "./CategoryScroller";
import { ScreenLayout } from "./ScreenLayout";

interface DeckSelectScreenProps {
  builtInDecks: Deck[];
  customDecks: Deck[];
  onSelect: (deckId: string) => void;
  onBack: () => void;
  onEditDecks: () => void;
  favoriteDeckIds: string[];
  classroomOnly: boolean;
  recentDeckIds: string[];
  onClassroomOnlyChange: (value: boolean) => void;
  onToggleFavorite: (deckId: string) => void;
  onSelectMixed: (decks: Deck[], label: string) => void;
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="deck-search-icon" viewBox="0 0 24 24" focusable="false">
      <path d="M10.8 17.2a6.4 6.4 0 1 0 0-12.8 6.4 6.4 0 0 0 0 12.8Z" />
      <path d="m15.8 15.8 4.1 4.1" />
    </svg>
  );
}

function DeckCard({
  deck,
  favorite,
  recent,
  onSelect,
  onToggleFavorite,
}: {
  deck: Deck;
  favorite: boolean;
  recent: boolean;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}) {
  const metadataLabels = [
    deck.subject,
    deck.ageRange,
    deck.classroomSafe === true ? "Classroom safe" : null,
  ].filter((label): label is string => Boolean(label));

  return (
    <article className="deck-card-shell">
      <button
        className="deck-card"
        type="button"
        aria-label={deck.name}
        onClick={() => onSelect(deck.id)}
      >
        <span className="deck-card__type">{deck.builtIn ? deck.category ?? "Built-in deck" : "Custom deck"}</span>
        <strong>{deck.name}</strong>
        <span>{deck.description ?? "Your custom guessing deck."}</span>
        {metadataLabels.length > 0 && (
          <span className="deck-card__metadata" aria-label={`${deck.name} metadata`}>
            {metadataLabels.map((label) => (
              <span className="deck-card__metadata-label" key={label}>
                {label}
              </span>
            ))}
          </span>
        )}
        {recent && <small>Recently played</small>}
      </button>
      <button
        className={`favorite-button ${favorite ? "is-selected" : ""}`}
        type="button"
        aria-label={`${favorite ? "Remove" : "Add"} ${deck.name} ${favorite ? "from" : "to"} favorites`}
        aria-pressed={favorite}
        onClick={() => onToggleFavorite(deck.id)}
      >
        {favorite ? "★" : "☆"}
      </button>
    </article>
  );
}

const ALL_CATEGORIES = "All";

export function DeckSelectScreen({
  builtInDecks,
  customDecks,
  onSelect,
  onBack,
  onEditDecks,
  favoriteDeckIds,
  classroomOnly,
  recentDeckIds,
  onClassroomOnlyChange,
  onToggleFavorite,
  onSelectMixed,
}: DeckSelectScreenProps) {
  const availableBuiltInDecks = useMemo(
    () => builtInDecks.filter((deck) => !classroomOnly || deck.classroomSafe !== false),
    [builtInDecks, classroomOnly],
  );
  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          availableBuiltInDecks
            .map((deck) => deck.category)
            .filter((category): category is string => Boolean(category)),
        ),
      ),
    [availableBuiltInDecks],
  );
  const [selectedCategory, setSelectedCategory] = useState(() => categories[0] ?? ALL_CATEGORIES);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoryBuiltInDecks =
    selectedCategory === ALL_CATEGORIES
      ? availableBuiltInDecks
      : availableBuiltInDecks.filter((deck) => deck.category === selectedCategory);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matchesSearch = (deck: Deck) =>
    !normalizedQuery ||
    `${deck.name} ${deck.description ?? ""} ${deck.subject ?? ""} ${deck.ageRange ?? ""} ${(deck.tags ?? []).join(" ")}`
      .toLocaleLowerCase()
      .includes(normalizedQuery);
  const searchIsActive = Boolean(normalizedQuery);
  const builtInDeckSearchBase = searchIsActive ? availableBuiltInDecks : categoryBuiltInDecks;
  const visibleBuiltInDecks = builtInDeckSearchBase.filter(matchesSearch);
  const visibleCustomDecks = customDecks.filter(matchesSearch);
  const surpriseCandidates = [...visibleBuiltInDecks, ...visibleCustomDecks];
  const mixedDeckLabel = searchIsActive
    ? "Search Results"
    : selectedCategory;
  const mixedCategoryLabel = searchIsActive
    ? "search results"
    : selectedCategory === ALL_CATEGORIES
      ? "all categories"
      : selectedCategory;

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (selectedCategory !== ALL_CATEGORIES && !categories.includes(selectedCategory)) {
      setSelectedCategory(categories[0] ?? ALL_CATEGORIES);
    }
  }, [categories, selectedCategory]);

  const closeSearch = () => {
    setQuery("");
    setSearchOpen(false);
  };

  const chooseSurprise = () => {
    const deck = surpriseCandidates[Math.floor(Math.random() * surpriseCandidates.length)];
    if (deck) {
      onSelect(deck.id);
    }
  };
  const renderDeckCard = (deck: Deck) => (
    <DeckCard
      key={deck.id}
      deck={deck}
      favorite={favoriteDeckIds.includes(deck.id)}
      recent={recentDeckIds.includes(deck.id)}
      onSelect={onSelect}
      onToggleFavorite={onToggleFavorite}
    />
  );

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
        ariaLabel="Deck Categories"
        categories={[ALL_CATEGORIES, ...categories]}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />
      <section className="deck-toolbar" aria-label="Deck Tools">
        <div className="deck-toolbar__main">
          <div className={`deck-search-control ${searchOpen ? "is-open" : ""}`}>
            {searchOpen ? (
              <div className="deck-search-control__field">
                <SearchIcon />
                <input
                  aria-label="Search Decks"
                  className="deck-search-control__input"
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search Decks"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      closeSearch();
                    }
                  }}
                />
                <button
                  className="deck-search-control__close"
                  type="button"
                  aria-label="Close Deck Search"
                  onClick={closeSearch}
                >
                  ×
                </button>
              </div>
            ) : (
              <button
                className="deck-search-control__button"
                type="button"
                aria-label="Search Decks"
                aria-expanded="false"
                onClick={() => setSearchOpen(true)}
              >
                <SearchIcon />
              </button>
            )}
          </div>
          <div className="deck-toolbar__actions">
            <label className="deck-safe-toggle">
              <input
                type="checkbox"
                checked={classroomOnly}
                onChange={(event) => onClassroomOnlyChange(event.currentTarget.checked)}
              />
              <span>Classroom-safe decks only</span>
            </label>
            <button
              className="button button--secondary button--small"
              type="button"
              disabled={surpriseCandidates.length === 0}
              onClick={chooseSurprise}
            >
              Surprise Me
            </button>
            {visibleBuiltInDecks.length > 1 && (
              <button
                className="button button--secondary button--small"
                type="button"
                aria-describedby="mixed-category-help"
                onClick={() => onSelectMixed(visibleBuiltInDecks, mixedDeckLabel)}
              >
                Play Mixed Category
              </button>
            )}
          </div>
        </div>
        {visibleBuiltInDecks.length > 1 && (
          <p className="deck-mixed-help" id="mixed-category-help">
            Mixed category combines visible built-in decks in {mixedCategoryLabel} into one shuffled round.
          </p>
        )}
      </section>
      <div className="section-heading">
        <h2>
          {searchIsActive
            ? "Search Results"
            : selectedCategory === ALL_CATEGORIES
              ? "All Built-In Decks"
              : selectedCategory}
        </h2>
      </div>
      <section className="deck-grid" aria-label="Built-In Decks">
        {visibleBuiltInDecks.map(renderDeckCard)}
      </section>
      <div className="section-heading">
        <h2>Your Decks</h2>
        <button className="button button--small button--secondary" type="button" onClick={onEditDecks}>
          Manage Decks
        </button>
      </div>
      {visibleCustomDecks.length > 0 ? (
        <section className="deck-grid" aria-label="Custom Decks">
          {visibleCustomDecks.map(renderDeckCard)}
        </section>
      ) : (
        <p className="empty-state">No custom decks yet. Create one for your next review.</p>
      )}
    </ScreenLayout>
  );
}
