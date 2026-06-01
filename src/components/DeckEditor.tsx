import { useMemo, useState } from "react";
import { builtInDecks } from "../data/builtInDecks";
import {
  cardsFromLines,
  copyDeck,
  createDeck,
  exportDeck,
  importDeck,
  saveCustomDecks,
} from "../services/deckStorage";
import type { Card, Deck, Difficulty } from "../types";
import { createId } from "../utils/id";
import { ScreenLayout } from "./ScreenLayout";

interface DeckEditorProps {
  customDecks: Deck[];
  onDecksChange: (decks: Deck[]) => void;
  onBack: () => void;
}

function downloadJson(deck: Deck): void {
  const blob = new Blob([exportDeck(deck)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${deck.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function DeckEditor({ customDecks, onDecksChange, onBack }: DeckEditorProps) {
  const [selectedDeckId, setSelectedDeckId] = useState(customDecks[0]?.id ?? "");
  const [lineImport, setLineImport] = useState("");
  const [jsonImport, setJsonImport] = useState("");
  const [error, setError] = useState<string | null>(null);
  const selectedDeck = useMemo(
    () => customDecks.find((deck) => deck.id === selectedDeckId),
    [customDecks, selectedDeckId],
  );

  const commitDecks = (decks: Deck[]) => {
    try {
      const saved = saveCustomDecks(decks);
      onDecksChange(saved);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "This deck could not be saved.");
    }
  };

  const updateSelectedDeck = (partial: Partial<Deck>) => {
    if (!selectedDeck) {
      return;
    }
    commitDecks(customDecks.map((deck) => (deck.id === selectedDeck.id ? { ...deck, ...partial } : deck)));
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
    if (!selectedDeck) {
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
    updateSelectedDeck({ cards: selectedDeck.cards.filter((card) => card.id !== cardId) });
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
    const cards = cardsFromLines(lineImport);
    if (!selectedDeck || cards.length === 0) {
      setError("Paste at least one non-empty line.");
      return;
    }
    updateSelectedDeck({ cards: [...selectedDeck.cards, ...cards] });
    setLineImport("");
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

  return (
    <ScreenLayout
      title="Deck Workshop"
      eyebrow="Make review your own"
      actions={
        <button className="button button--ghost" type="button" onClick={onBack}>
          Done
        </button>
      }
    >
      {error && <p className="notice notice--warning">{error}</p>}
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
          {builtInDecks.map((deck) => (
            <button className="editor-deck-link" key={deck.id} type="button" onClick={() => addCopy(deck)}>
              {deck.name}
              <small>Make editable copy</small>
            </button>
          ))}
        </aside>

        <section className="editor-main">
          {selectedDeck ? (
            <>
              <section className="panel stack">
                <label>
                  <span className="field-label">Deck name</span>
                  <input
                    value={selectedDeck.name}
                    onChange={(event) => updateSelectedDeck({ name: event.target.value })}
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
                {selectedDeck.cards.map((card) => (
                  <article className="card-editor panel" key={card.id}>
                    <label>
                      <span className="field-label">Prompt</span>
                      <input value={card.prompt} onChange={(event) => updateCard(card.id, { prompt: event.target.value })} />
                    </label>
                    <label>
                      <span className="field-label">Answer or hint</span>
                      <input value={card.answer ?? ""} onChange={(event) => updateCard(card.id, { answer: event.target.value })} />
                    </label>
                    <label>
                      <span className="field-label">Category</span>
                      <input value={card.category ?? ""} onChange={(event) => updateCard(card.id, { category: event.target.value })} />
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
