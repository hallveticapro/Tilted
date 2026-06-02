import { useEffect, useMemo, useRef, useState } from "react";
import { builtInDecks } from "../data/builtInDecks";
import {
  cardsFromLines,
  clearCustomDeckRecovery,
  copyDeck,
  createDeck,
  exportDeck,
  getCustomDeckRecovery,
  importDeck,
  saveCustomDecks,
} from "../services/deckStorage";
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

function downloadJson(deck: Deck): void {
  downloadText(
    exportDeck(deck),
    `${deck.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "tilted-deck"}.json`,
  );
}

function downloadText(text: string, filename: string): void {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function DeckEditor({ customDecks, onDecksChange, onBack }: DeckEditorProps) {
  const [selectedDeckId, setSelectedDeckId] = useState(customDecks[0]?.id ?? "");
  const [lineImport, setLineImport] = useState("");
  const [jsonImport, setJsonImport] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deletedCard, setDeletedCard] = useState<{ card: Card; index: number } | null>(null);
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
    () => customDecks.find((deck) => deck.id === selectedDeckId),
    [customDecks, selectedDeckId],
  );

  const clearPersistTimeout = () => {
    if (persistTimeoutRef.current !== null) {
      window.clearTimeout(persistTimeoutRef.current);
      persistTimeoutRef.current = null;
    }
  };

  const persistDecks = (decks: Deck[]) => {
    try {
      const saved = saveCustomDecks(decks);
      onDecksChange(saved);
      pendingDecksRef.current = null;
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "This deck could not be saved.");
    }
  };

  const commitDecks = (decks: Deck[]) => {
    clearPersistTimeout();
    pendingDecksRef.current = null;
    persistDecks(decks);
  };

  const scheduleDecks = (decks: Deck[]) => {
    onDecksChange(decks);
    pendingDecksRef.current = decks;
    clearPersistTimeout();
    persistTimeoutRef.current = window.setTimeout(() => {
      persistTimeoutRef.current = null;
      persistDecks(decks);
    }, 350);
  };

  const flushDecks = () => {
    clearPersistTimeout();
    if (pendingDecksRef.current) {
      persistDecks(pendingDecksRef.current);
    }
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
    const decks = customDecks.map((deck) => (deck.id === selectedDeck.id ? { ...deck, ...partial } : deck));
    if (deferred) {
      scheduleDecks(decks);
    } else {
      commitDecks(decks);
    }
  };

  const addDeck = () => {
    const deck = createDeck();
    commitDecks([...customDecks, deck]);
    setSelectedDeckId(deck.id);
  };

  const addCopy = (deck: Deck) => {
    const copied = copyDeck(deck);
    commitDecks([...customDecks, copied]);
    setSelectedDeckId(copied.id);
  };

  const deleteDeck = () => {
    if (!selectedDeck || !window.confirm(`Delete "${selectedDeck.name}"? This cannot be undone.`)) {
      return;
    }
    const remaining = customDecks.filter((deck) => deck.id !== selectedDeck.id);
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
    setDeletedCard({ card, index });
    updateSelectedDeck({ cards: selectedDeck.cards.filter((candidate) => candidate.id !== cardId) });
  };

  const undoDeleteCard = () => {
    if (!selectedDeck || !deletedCard) {
      return;
    }
    const cards = [...selectedDeck.cards];
    cards.splice(deletedCard.index, 0, deletedCard.card);
    updateSelectedDeck({ cards });
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

  const importLines = () => {
    try {
      const cards = cardsFromLines(lineImport);
      if (!selectedDeck || cards.length === 0) {
        setError("Paste at least one non-empty line.");
        return;
      }
      updateSelectedDeck({ cards: [...selectedDeck.cards, ...cards] });
      setLineImport("");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Those cards could not be imported.");
    }
  };

  const importJson = () => {
    try {
      const deck = importDeck(jsonImport);
      commitDecks([...customDecks, deck]);
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
            flushDecks();
            onBack();
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
          {customDecks.length === 0 && <p className="muted">Create a deck or copy a starter.</p>}
          {customDecks.map((deck) => (
            <button
              className={`editor-deck-link ${selectedDeckId === deck.id ? "is-selected" : ""}`}
              key={deck.id}
              type="button"
              onClick={() => setSelectedDeckId(deck.id)}
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
                <div className="button-row">
                  <button className="button button--secondary" type="button" onClick={() => downloadJson(selectedDeck)}>
                    Export JSON
                  </button>
                  <button className="button button--danger" type="button" onClick={deleteDeck}>
                    Delete deck
                  </button>
                </div>
              </section>
              <section className="stack">
                <div className="section-heading">
                  <h2>Cards</h2>
                  <button className="button button--small button--primary" type="button" onClick={addCard}>
                    Add card
                  </button>
                </div>
                {deletedCard && (
                  <div className="notice notice--warning undo-notice">
                    <span>Deleted "{deletedCard.card.prompt}".</span>
                    <button className="button button--small button--secondary" type="button" onClick={undoDeleteCard}>
                      Undo
                    </button>
                  </div>
                )}
                {selectedDeck.cards.map((card) => (
                  <article className="card-editor panel" key={card.id}>
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
        </section>
      </section>
    </ScreenLayout>
  );
}
