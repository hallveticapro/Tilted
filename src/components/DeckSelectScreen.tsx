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
  favoriteDeckIds: string[];
  recentDeckIds: string[];
  classroomOnly: boolean;
  onClassroomOnlyChange: (value: boolean) => void;
  onToggleFavorite: (deckId: string) => void;
  onSelectMixed: (decks: Deck[], label: string) => void;
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
  recentDeckIds,
  classroomOnly,
  onClassroomOnlyChange,
  onToggleFavorite,
  onSelectMixed,
}: DeckSelectScreenProps) {
  const categories = useMemo(
    () =>
      Array.from(
        new Set(builtInDecks.map((deck) => deck.category).filter((category): category is string => Boolean(category))),
      ),
    [builtInDecks],
  );
  const [selectedCategory, setSelectedCategory] = useState(() => categories[0] ?? ALL_CATEGORIES);
  const [query, setQuery] = useState("");
  const [library, setLibrary] = useState<"all" | "built-in" | "custom">("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mixedInfoOpen, setMixedInfoOpen] = useState(false);
  const categoryBuiltInDecks =
    selectedCategory === ALL_CATEGORIES
      ? builtInDecks
      : builtInDecks.filter((deck) => deck.category === selectedCategory);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matchesSearch = (deck: Deck) =>
    !normalizedQuery ||
    `${deck.name} ${deck.description ?? ""} ${(deck.tags ?? []).join(" ")}`
      .toLocaleLowerCase()
      .includes(normalizedQuery);
  const visibleBuiltInDecks = categoryBuiltInDecks.filter(
    (deck) => (!classroomOnly || deck.classroomSafe) && matchesSearch(deck),
  );
  const visibleCustomDecks = customDecks.filter(matchesSearch);
  const surpriseCandidates = [
    ...(library === "custom" ? [] : visibleBuiltInDecks),
    ...(library === "built-in" ? [] : visibleCustomDecks),
  ];
  const hasActiveDiscoveryFilters = Boolean(normalizedQuery) || library !== "all" || classroomOnly;
  const mixedCategoryLabel = selectedCategory === ALL_CATEGORIES ? "all categories" : selectedCategory;
  const clearDiscoveryFilters = () => {
    setQuery("");
    setLibrary("all");
    onClassroomOnlyChange(false);
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
        ariaLabel="Deck categories"
        categories={[ALL_CATEGORIES, ...categories]}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />
      <section className="deck-toolbar" aria-label="Deck tools">
        <div className="deck-toolbar__actions">
          <button
            className={`button button--ghost button--small deck-search-toggle ${hasActiveDiscoveryFilters ? "is-active" : ""}`}
            type="button"
            aria-label={searchOpen ? "Hide deck search and filters" : "Show deck search and filters"}
            aria-expanded={searchOpen}
            aria-controls="deck-search-filters"
            onClick={() => setSearchOpen((current) => !current)}
          >
            <span className="deck-search-toggle__icon" aria-hidden="true" />
            <span>Search</span>
            {hasActiveDiscoveryFilters && <small>Filters on</small>}
          </button>
          <button
            className="button button--secondary button--small"
            type="button"
            disabled={surpriseCandidates.length === 0}
            onClick={chooseSurprise}
          >
            Surprise Me
          </button>
          {library !== "custom" && visibleBuiltInDecks.length > 1 && (
            <div className="mixed-play-control">
              <button
                className="button button--secondary button--small"
                type="button"
                onClick={() => onSelectMixed(visibleBuiltInDecks, selectedCategory)}
              >
                Play Mixed Category
              </button>
              <button
                className="mixed-info-button"
                type="button"
                aria-label="Explain Play Mixed Category"
                aria-expanded={mixedInfoOpen}
                aria-controls="mixed-category-help"
                onClick={() => setMixedInfoOpen((current) => !current)}
              >
                ?
              </button>
            </div>
          )}
        </div>
        {mixedInfoOpen && (
          <p className="deck-mixed-help" id="mixed-category-help">
            Mixed category shuffles cards from every visible built-in deck in {mixedCategoryLabel}.
            Use it when you want one bigger grab bag instead of choosing a single deck.
          </p>
        )}
      </section>
      {searchOpen && (
        <section className="panel deck-discovery" id="deck-search-filters" aria-label="Deck search and filters">
          <label>
            <span className="field-label">Find a deck</span>
            <input type="search" placeholder="Search decks" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <div className="segmented-control segmented-control--three" role="group" aria-label="Deck library">
            {(["all", "built-in", "custom"] as const).map((option) => (
              <button className={library === option ? "is-selected" : ""} key={option} type="button" onClick={() => setLibrary(option)}>{option}</button>
            ))}
          </div>
          <label className="toggle-row toggle-row--compact">
            <span><strong>Classroom-safe decks only</strong></span>
            <input aria-label="Show classroom-safe decks only" type="checkbox" checked={classroomOnly} onChange={(event) => onClassroomOnlyChange(event.target.checked)} />
          </label>
          {hasActiveDiscoveryFilters && (
            <button className="button button--ghost button--small" type="button" onClick={clearDiscoveryFilters}>
              Clear search and filters
            </button>
          )}
        </section>
      )}
      {(library === "all" || library === "built-in") && <div className="section-heading">
        <h2>{selectedCategory === ALL_CATEGORIES ? "All built-in decks" : selectedCategory}</h2>
      </div>
      }
      {(library === "all" || library === "built-in") && <section className="deck-grid" aria-label="Built-in decks">
        {visibleBuiltInDecks.map(renderDeckCard)}
      </section>}
      {(library === "all" || library === "custom") && <div className="section-heading">
        <h2>Your decks</h2>
        <button className="button button--small button--secondary" type="button" onClick={onEditDecks}>
          Manage decks
        </button>
      </div>}
      {(library === "all" || library === "custom") && (visibleCustomDecks.length > 0 ? (
        <section className="deck-grid" aria-label="Custom decks">
          {visibleCustomDecks.map(renderDeckCard)}
        </section>
      ) : (
        <p className="empty-state">No custom decks yet. Create one for your next review.</p>
      ))}
    </ScreenLayout>
  );
}
