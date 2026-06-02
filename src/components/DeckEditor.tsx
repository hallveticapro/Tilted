import { useEffect, useMemo, useRef, useState } from "react";
import { builtInDecks } from "../data/builtInDecks";
import {
  cardsFromLines,
  cardsFromCsv,
  clearCustomDeckRecovery,
  copyDeck,
  createDeck,
  exportDeck,
  exportDeckCsv,
  exportDeckLibrary,
  getCustomDeckRecovery,
  importDeck,
  importDeckLibrary,
  saveCustomDecks,
} from "../services/deckStorage";
import { createDeckShareUrl } from "../services/deckSharing";
import { downloadText } from "../services/download";
import type { Card, Deck, Difficulty } from "../types";
import { createId } from "../utils/id";
import { CategoryScroller } from "./CategoryScroller";
import { ScreenLayout } from "./ScreenLayout";

interface DeckEditorProps {
  customDecks: Deck[];
  onDecksChange: (decks: Deck[]) => void;
  onBack: () => void;
}

const ALL_CATEGORIES = "All";
const CARD_PAGE_SIZE = 30;

function downloadJson(deck: Deck): void {
  downloadText(
    exportDeck(deck),
    `${deck.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "tilted-deck"}.json`,
    "application/json",
  );
}

export function DeckEditor({ customDecks, onDecksChange, onBack }: DeckEditorProps) {
  const [workingDecks, setWorkingDecks] = useState(customDecks);
  const [selectedDeckId, setSelectedDeckId] = useState(customDecks[0]?.id ?? "");
  const [lineImport, setLineImport] = useState("");
  const [jsonImport, setJsonImport] = useState("");
  const [csvImport, setCsvImport] = useState("");
  const [libraryImport, setLibraryImport] = useState("");
  const [bulkCategory, setBulkCategory] = useState("");
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [cardPage, setCardPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [deletedCard, setDeletedCard] = useState<{
    card: Card;
    deckId: string;
    index: number;
  } | null>(null);
  const [hasRecovery, setHasRecovery] = useState(() => getCustomDeckRecovery() !== null);
  const persistTimeoutRef = useRef<number | null>(null);
  const pendingDecksRef = useRef<Deck[] | null>(null);
  const starterCategories = useMemo(
    () =>
      Array.from(
        new Set(
          builtInDecks
            .map((deck) => deck.category)
            .filter((category): category is string => Boolean(category)),
        ),
      ),
    [],
  );
  const [starterCategory, setStarterCategory] = useState(
    () => starterCategories[0] ?? ALL_CATEGORIES,
  );
  const visibleStarterDecks =
    starterCategory === ALL_CATEGORIES
      ? builtInDecks
      : builtInDecks.filter((deck) => deck.category === starterCategory);
  const selectedDeck = useMemo(
    () => workingDecks.find((deck) => deck.id === selectedDeckId),
    [selectedDeckId, workingDecks],
  );
  const pageCount = Math.max(1, Math.ceil((selectedDeck?.cards.length ?? 0) / CARD_PAGE_SIZE));
  const visibleCards =
    selectedDeck?.cards.slice(cardPage * CARD_PAGE_SIZE, (cardPage + 1) * CARD_PAGE_SIZE) ?? [];

  const clearPersistTimeout = () => {
    if (persistTimeoutRef.current !== null) {
      window.clearTimeout(persistTimeoutRef.current);
      persistTimeoutRef.current = null;
    }
  };

  const persistDecks = (decks: Deck[]): boolean => {
    try {
      const saved = saveCustomDecks(decks);
      setWorkingDecks(saved);
      onDecksChange(saved);
      pendingDecksRef.current = null;
      setError(null);
      return true;
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "This deck could not be saved.");
      return false;
    }
  };

  const commitDecks = (decks: Deck[]) => {
    clearPersistTimeout();
    pendingDecksRef.current = null;
    setWorkingDecks(decks);
    persistDecks(decks);
  };

  const scheduleDecks = (decks: Deck[]) => {
    setWorkingDecks(decks);
    pendingDecksRef.current = decks;
    clearPersistTimeout();
    persistTimeoutRef.current = window.setTimeout(() => {
      persistTimeoutRef.current = null;
      persistDecks(decks);
    }, 350);
  };

  const flushDecks = (): boolean => {
    clearPersistTimeout();
    if (pendingDecksRef.current) {
      return persistDecks(pendingDecksRef.current);
    }
    return true;
  };

  useEffect(
    () => () => {
      clearPersistTimeout();
      if (pendingDecksRef.current) {
        try {
          saveCustomDecks(pendingDecksRef.current);
        } catch {
          // Invalid in-progress edits remain visible until the user corrects them.
        }
      }
    },
    [],
  );

  const updateSelectedDeck = (partial: Partial<Deck>, deferred = false) => {
    if (!selectedDeck) {
      return;
    }
    const decks = workingDecks.map((deck) => (deck.id === selectedDeck.id ? { ...deck, ...partial } : deck));
    if (deferred) {
      scheduleDecks(decks);
    } else {
      commitDecks(decks);
    }
  };

  const addDeck = () => {
    const deck = createDeck();
    commitDecks([...workingDecks, deck]);
    setSelectedDeckId(deck.id);
  };

  const addCopy = (deck: Deck) => {
    const copied = copyDeck(deck);
    commitDecks([...workingDecks, copied]);
    setSelectedDeckId(copied.id);
  };

  const deleteDeck = () => {
    if (!selectedDeck || !window.confirm(`Delete "${selectedDeck.name}"? This cannot be undone.`)) {
      return;
    }
    const remaining = workingDecks.filter((deck) => deck.id !== selectedDeck.id);
    commitDecks(remaining);
    setSelectedDeckId(remaining[0]?.id ?? "");
  };

  const updateCard = (cardId: string, partial: Partial<Card>) => {
    if (!selectedDeck) {
      return;
    }
    updateSelectedDeck({
      cards: selectedDeck.cards.map((card) => (card.id === cardId ? { ...card, ...partial } : card)),
    });
  };

  const moveCard = (cardId: string, direction: -1 | 1) => {
    if (!selectedDeck) {
      return;
    }
    const index = selectedDeck.cards.findIndex((card) => card.id === cardId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= selectedDeck.cards.length) {
      return;
    }
    const cards = [...selectedDeck.cards];
    [cards[index], cards[nextIndex]] = [cards[nextIndex], cards[index]];
    updateSelectedDeck({ cards });
  };

  const toggleSelectedCard = (cardId: string) =>
    setSelectedCardIds((current) =>
      current.includes(cardId) ? current.filter((id) => id !== cardId) : [...current, cardId],
    );

  const bulkDelete = () => {
    if (!selectedDeck || selectedCardIds.length === 0) {
      return;
    }
    const cards = selectedDeck.cards.filter((card) => !selectedCardIds.includes(card.id));
    if (cards.length === 0) {
      setError("Keep at least one card in the deck.");
      return;
    }
    updateSelectedDeck({ cards });
    setSelectedCardIds([]);
  };

  const bulkAssignCategory = () => {
    if (!selectedDeck || selectedCardIds.length === 0) {
      return;
    }
    updateSelectedDeck({
      cards: selectedDeck.cards.map((card) =>
        selectedCardIds.includes(card.id) ? { ...card, category: bulkCategory } : card,
      ),
    });
    setSelectedCardIds([]);
    setBulkCategory("");
  };

  const deleteCard = (cardId: string) => {
    if (!selectedDeck || selectedDeck.cards.length === 1) {
      setError("A deck needs at least one card.");
      return;
    }
    const index = selectedDeck.cards.findIndex((card) => card.id === cardId);
    const card = selectedDeck.cards[index];
    if (!card) {
      return;
    }
    setDeletedCard({ card, deckId: selectedDeck.id, index });
    updateSelectedDeck({ cards: selectedDeck.cards.filter((candidate) => candidate.id !== cardId) });
  };

  const undoDeleteCard = () => {
    if (!deletedCard) {
      return;
    }
    const sourceDeck = workingDecks.find((deck) => deck.id === deletedCard.deckId);
    if (!sourceDeck) {
      setDeletedCard(null);
      return;
    }
    const cards = [...sourceDeck.cards];
    cards.splice(deletedCard.index, 0, deletedCard.card);
    commitDecks(
      workingDecks.map((deck) => (deck.id === sourceDeck.id ? { ...deck, cards } : deck)),
    );
    setDeletedCard(null);
  };

  const addCard = () => {
    if (!selectedDeck) {
      return;
    }
    updateSelectedDeck({
      cards: [...selectedDeck.cards, { id: createId("card"), prompt: "New card" }],
    });
  };

  const appendUniqueCards = (cards: Card[]) => {
    if (!selectedDeck) {
      return 0;
    }
    const prompts = new Set(
      selectedDeck.cards.map(({ prompt }) => prompt.trim().toLocaleLowerCase()),
    );
    const uniqueCards = cards.filter(({ prompt }) => {
      const key = prompt.trim().toLocaleLowerCase();
      if (prompts.has(key)) {
        return false;
      }
      prompts.add(key);
      return true;
    });
    if (uniqueCards.length > 0) {
      updateSelectedDeck({ cards: [...selectedDeck.cards, ...uniqueCards] });
    }
    return uniqueCards.length;
  };

  const importLines = () => {
    try {
      const cards = cardsFromLines(lineImport);
      if (!selectedDeck || cards.length === 0) {
        setError("Paste at least one non-empty line.");
        return;
      }
      const addedCardCount = appendUniqueCards(cards);
      setLineImport("");
      if (addedCardCount < cards.length) {
        setError("Skipped duplicate prompts that were already in this deck.");
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Those cards could not be imported.");
    }
  };

  const importCsv = () => {
    try {
      const cards = cardsFromCsv(csvImport);
      if (!selectedDeck || cards.length === 0) {
        setError("Paste at least one CSV card.");
        return;
      }
      const addedCardCount = appendUniqueCards(cards);
      setCsvImport("");
      if (addedCardCount < cards.length) {
        setError("Skipped duplicate prompts that were already in this deck.");
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "That CSV could not be imported.");
    }
  };

  const importLibrary = () => {
    try {
      const decks = importDeckLibrary(libraryImport);
      commitDecks([...workingDecks, ...decks]);
      setSelectedDeckId(decks[0]?.id ?? selectedDeckId);
      setLibraryImport("");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "That deck library could not be imported.");
    }
  };

  const shareDeck = async () => {
    if (!selectedDeck) {
      return;
    }
    const url = createDeckShareUrl(selectedDeck);
    if (navigator.share) {
      try {
        await navigator.share({ title: `${selectedDeck.name} - Tilted`, url });
        setShareMessage("Share sheet opened.");
        return;
      } catch {
        // Copying the URL is a reliable fallback when the share sheet is dismissed.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareMessage("Share URL copied.");
    } catch {
      setShareMessage(url);
    }
  };

  const importJson = () => {
    try {
      const deck = importDeck(jsonImport);
      commitDecks([...workingDecks, deck]);
      setSelectedDeckId(deck.id);
      setJsonImport("");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "That deck could not be imported.");
    }
  };

  const downloadRecovery = () => {
    const recovery = getCustomDeckRecovery();
    if (recovery) {
      downloadText(recovery, "tilted-custom-decks-recovery.json");
    }
  };

  const discardRecovery = () => {
    clearCustomDeckRecovery();
    setHasRecovery(false);
  };

  return (
    <ScreenLayout
      title="Deck Workshop"
      eyebrow="Make review your own"
      actions={
        <button
          className="button button--ghost"
          type="button"
          onClick={() => {
            if (flushDecks()) {
              onBack();
            }
          }}
        >
          Done
        </button>
      }
    >
      {error && <p className="notice notice--warning">{error}</p>}
      {hasRecovery && (
        <section className="notice notice--warning recovery-notice">
          <p>A malformed custom-deck backup was preserved. Download it before discarding it.</p>
          <div className="button-row">
            <button className="button button--secondary button--small" type="button" onClick={downloadRecovery}>
              Download recovery backup
            </button>
            <button className="button button--ghost button--small" type="button" onClick={discardRecovery}>
              Discard backup
            </button>
          </div>
        </section>
      )}
      <section className="editor-layout">
        <aside className="editor-sidebar panel">
          <div className="section-heading">
            <h2>Your decks</h2>
            <button className="button button--small button--primary" type="button" onClick={addDeck}>
              New
            </button>
          </div>
          <button className="button button--small button--secondary editor-library-export" type="button" onClick={() => downloadText(exportDeckLibrary(workingDecks), "tilted-deck-library.json", "application/json")}>
            Export library
          </button>
          {workingDecks.length === 0 && <p className="muted">Create a deck or copy a starter.</p>}
          {workingDecks.map((deck) => (
            <button
              className={`editor-deck-link ${selectedDeckId === deck.id ? "is-selected" : ""}`}
              key={deck.id}
              type="button"
              onClick={() => {
                setSelectedDeckId(deck.id);
                setDeletedCard(null);
                setCardPage(0);
              }}
            >
              {deck.name}
              <small>{deck.cards.length} cards</small>
            </button>
          ))}
          <h3>Copy a starter</h3>
          <CategoryScroller
            ariaLabel="Starter deck categories"
            categories={[ALL_CATEGORIES, ...starterCategories]}
            selectedCategory={starterCategory}
            onSelect={setStarterCategory}
            compact
          />
          <section className="starter-decks" aria-label="Starter decks">
            <p className="muted starter-decks__count">
              {visibleStarterDecks.length} {visibleStarterDecks.length === 1 ? "deck" : "decks"}
            </p>
            {visibleStarterDecks.map((deck) => (
              <button className="editor-deck-link" key={deck.id} type="button" onClick={() => addCopy(deck)}>
                {deck.name}
                <small>Make editable copy</small>
              </button>
            ))}
          </section>
        </aside>

        <section className="editor-main">
          {selectedDeck ? (
            <>
              <section className="panel stack">
                <label>
                  <span className="field-label">Deck name</span>
                  <input
                    value={selectedDeck.name}
                    onChange={(event) => updateSelectedDeck({ name: event.target.value }, true)}
                  />
                </label>
                <label>
                  <span className="field-label">Optional category</span>
                  <input
                    value={selectedDeck.category ?? ""}
                    onChange={(event) => updateSelectedDeck({ category: event.target.value }, true)}
                  />
                </label>
                <label>
                  <span className="field-label">Optional description</span>
                  <textarea value={selectedDeck.description ?? ""} onChange={(event) => updateSelectedDeck({ description: event.target.value }, true)} />
                </label>
                <div className="button-row">
                  <button className="button button--secondary" type="button" onClick={() => downloadJson(selectedDeck)}>
                    Export JSON
                  </button>
                  <button className="button button--secondary" type="button" onClick={() => downloadText(exportDeckCsv(selectedDeck), `${selectedDeck.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "tilted-deck"}.csv`, "text/csv")}>
                    Export CSV
                  </button>
                  <button className="button button--secondary" type="button" onClick={shareDeck}>
                    Share deck
                  </button>
                  <button className="button button--danger" type="button" onClick={deleteDeck}>
                    Delete deck
                  </button>
                </div>
                {shareMessage && <p className="muted share-message">{shareMessage}</p>}
              </section>
              <section className="stack">
                <div className="section-heading">
                  <h2>Cards</h2>
                  <button className="button button--small button--primary" type="button" onClick={addCard}>
                    Add card
                  </button>
                </div>
                {pageCount > 1 && (
                  <div className="button-row card-pagination">
                    <button className="button button--small button--ghost" type="button" disabled={cardPage === 0} onClick={() => setCardPage((current) => current - 1)}>Previous cards</button>
                    <span className="muted">Page {cardPage + 1} of {pageCount}</span>
                    <button className="button button--small button--ghost" type="button" disabled={cardPage + 1 >= pageCount} onClick={() => setCardPage((current) => current + 1)}>Next cards</button>
                  </div>
                )}
                {deletedCard && (
                  <div className="notice notice--warning undo-notice">
                    <span>Deleted "{deletedCard.card.prompt}".</span>
                    <button className="button button--small button--secondary" type="button" onClick={undoDeleteCard}>
                      Undo
                    </button>
                  </div>
                )}
                {selectedCardIds.length > 0 && (
                  <div className="panel bulk-card-actions">
                    <strong>{selectedCardIds.length} selected</strong>
                    <input aria-label="Bulk card category" placeholder="Assign category" value={bulkCategory} onChange={(event) => setBulkCategory(event.target.value)} />
                    <button className="button button--small button--secondary" type="button" onClick={bulkAssignCategory}>Assign category</button>
                    <button className="button button--small button--danger" type="button" onClick={bulkDelete}>Delete selected</button>
                  </div>
                )}
                {visibleCards.map((card) => (
                  <article className="card-editor panel" key={card.id}>
                    <label className="card-editor__select">
                      <span className="field-label">Select</span>
                      <input aria-label={`Select ${card.prompt}`} type="checkbox" checked={selectedCardIds.includes(card.id)} onChange={() => toggleSelectedCard(card.id)} />
                    </label>
                    <label>
                      <span className="field-label">Prompt</span>
                      <input value={card.prompt} onChange={(event) => updateSelectedDeck({
                        cards: selectedDeck.cards.map((candidate) =>
                          candidate.id === card.id ? { ...candidate, prompt: event.target.value } : candidate,
                        ),
                      }, true)} />
                    </label>
                    <label>
                      <span className="field-label">Optional hint</span>
                      <input value={card.answer ?? ""} onChange={(event) => updateSelectedDeck({
                        cards: selectedDeck.cards.map((candidate) =>
                          candidate.id === card.id ? { ...candidate, answer: event.target.value } : candidate,
                        ),
                      }, true)} />
                    </label>
                    <label>
                      <span className="field-label">Category</span>
                      <input value={card.category ?? ""} onChange={(event) => updateSelectedDeck({
                        cards: selectedDeck.cards.map((candidate) =>
                          candidate.id === card.id ? { ...candidate, category: event.target.value } : candidate,
                        ),
                      }, true)} />
                    </label>
                    <label>
                      <span className="field-label">Difficulty</span>
                      <select
                        value={card.difficulty ?? ""}
                        onChange={(event) =>
                          updateCard(card.id, {
                            difficulty: (event.target.value || undefined) as Difficulty | undefined,
                          })
                        }
                      >
                        <option value="">Not set</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </label>
                    <button className="button button--small button--danger" type="button" onClick={() => deleteCard(card.id)}>
                      Delete
                    </button>
                    <div className="card-editor__move">
                      <button className="button button--small button--ghost" type="button" aria-label={`Move ${card.prompt} up`} onClick={() => moveCard(card.id, -1)}>↑</button>
                      <button className="button button--small button--ghost" type="button" aria-label={`Move ${card.prompt} down`} onClick={() => moveCard(card.id, 1)}>↓</button>
                    </div>
                  </article>
                ))}
              </section>
              <section className="panel import-panel">
                <h2>Paste cards</h2>
                <p className="muted">Add one prompt per line.</p>
                <textarea value={lineImport} onChange={(event) => setLineImport(event.target.value)} />
                <button className="button button--secondary" type="button" onClick={importLines}>
                  Add pasted cards
                </button>
              </section>
              <section className="panel import-panel">
                <h2>Paste card CSV</h2>
                <p className="muted">Use prompt, hint, category, and difficulty columns.</p>
                <textarea value={csvImport} onChange={(event) => setCsvImport(event.target.value)} />
                <button className="button button--secondary" type="button" onClick={importCsv}>Add CSV cards</button>
              </section>
            </>
          ) : (
            <section className="panel empty-state">
              Create a custom deck or copy a starter to begin editing.
            </section>
          )}
          <section className="panel import-panel">
            <h2>Import deck JSON</h2>
            <textarea value={jsonImport} onChange={(event) => setJsonImport(event.target.value)} />
            <button className="button button--secondary" type="button" onClick={importJson}>
              Import JSON
            </button>
          </section>
          <section className="panel import-panel">
            <h2>Restore deck library</h2>
            <p className="muted">Import a whole-library JSON backup alongside your existing decks.</p>
            <textarea value={libraryImport} onChange={(event) => setLibraryImport(event.target.value)} />
            <button className="button button--secondary" type="button" onClick={importLibrary}>Import library backup</button>
          </section>
        </section>
      </section>
    </ScreenLayout>
  );
}
