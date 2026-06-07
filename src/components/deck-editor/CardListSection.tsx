import type { Dispatch, SetStateAction } from "react";
import type { Card, Deck, Difficulty } from "../../types";
import type { DeletedCardBatch } from "./useDeckWorkshop";

interface CardListSectionProps {
  bulkCategory: string;
  cardPage: number;
  deletedCards: DeletedCardBatch | null;
  pageCount: number;
  selectedCardIds: string[];
  selectedDeck: Deck;
  visibleCards: Card[];
  onAddCard: () => void;
  onBulkAssignCategory: () => void;
  onBulkDelete: () => void;
  onDeleteCard: (cardId: string) => void;
  onMoveCard: (cardId: string, direction: -1 | 1) => void;
  onSetBulkCategory: Dispatch<SetStateAction<string>>;
  onSetCardPage: Dispatch<SetStateAction<number>>;
  onToggleSelectedCard: (cardId: string) => void;
  onUndoDeleteCard: () => void;
  onUpdateCard: (cardId: string, partial: Partial<Card>) => void;
  onUpdateDeck: (partial: Partial<Deck>, deferred?: boolean) => void;
}

export function CardListSection({
  bulkCategory,
  cardPage,
  deletedCards,
  pageCount,
  selectedCardIds,
  selectedDeck,
  visibleCards,
  onAddCard,
  onBulkAssignCategory,
  onBulkDelete,
  onDeleteCard,
  onMoveCard,
  onSetBulkCategory,
  onSetCardPage,
  onToggleSelectedCard,
  onUndoDeleteCard,
  onUpdateCard,
  onUpdateDeck,
}: CardListSectionProps) {
  return (
    <section className="stack">
      <div className="section-heading">
        <h2>Cards</h2>
        <button className="button button--small button--primary" type="button" onClick={onAddCard}>
          Add Card
        </button>
      </div>
      {pageCount > 1 && (
        <div className="button-row card-pagination">
          <button
            className="button button--small button--ghost"
            type="button"
            disabled={cardPage === 0}
            onClick={() => onSetCardPage((current) => current - 1)}
          >
            Previous Cards
          </button>
          <span className="muted">Page {cardPage + 1} of {pageCount}</span>
          <button
            className="button button--small button--ghost"
            type="button"
            disabled={cardPage + 1 >= pageCount}
            onClick={() => onSetCardPage((current) => current + 1)}
          >
            Next Cards
          </button>
        </div>
      )}
      {deletedCards && (
        <div className="notice notice--warning undo-notice">
          <span>
            {deletedCards.cards.length === 1
              ? `Deleted "${deletedCards.cards[0].card.prompt}".`
              : `Deleted ${deletedCards.cards.length} cards.`}
          </span>
          <button className="button button--small button--secondary" type="button" onClick={onUndoDeleteCard}>
            Undo
          </button>
        </div>
      )}
      {selectedCardIds.length > 0 && (
        <div className="panel bulk-card-actions">
          <strong>{selectedCardIds.length} Selected</strong>
          <input
            aria-label="Bulk Card Category"
            placeholder="Assign Category"
            value={bulkCategory}
            onChange={(event) => onSetBulkCategory(event.target.value)}
          />
          <button className="button button--small button--secondary" type="button" onClick={onBulkAssignCategory}>
            Assign Category
          </button>
          <button className="button button--small button--danger" type="button" onClick={onBulkDelete}>
            Delete Selected
          </button>
        </div>
      )}
      {visibleCards.map((card) => (
        <article className="card-editor panel" key={card.id}>
          <label className="card-editor__select">
            <span className="field-label">Select</span>
            <input
              aria-label={`Select ${card.prompt}`}
              type="checkbox"
              checked={selectedCardIds.includes(card.id)}
              onChange={() => onToggleSelectedCard(card.id)}
            />
          </label>
          <label>
            <span className="field-label">Prompt</span>
            <input
              value={card.prompt}
              onChange={(event) =>
                onUpdateDeck(
                  {
                    cards: selectedDeck.cards.map((candidate) =>
                      candidate.id === card.id ? { ...candidate, prompt: event.target.value } : candidate,
                    ),
                  },
                  true,
                )
              }
            />
          </label>
          <label>
            <span className="field-label">Optional Hint</span>
            <input
              value={card.answer ?? ""}
              onChange={(event) =>
                onUpdateDeck(
                  {
                    cards: selectedDeck.cards.map((candidate) =>
                      candidate.id === card.id ? { ...candidate, answer: event.target.value } : candidate,
                    ),
                  },
                  true,
                )
              }
            />
          </label>
          <label>
            <span className="field-label">Category</span>
            <input
              value={card.category ?? ""}
              onChange={(event) =>
                onUpdateDeck(
                  {
                    cards: selectedDeck.cards.map((candidate) =>
                      candidate.id === card.id ? { ...candidate, category: event.target.value } : candidate,
                    ),
                  },
                  true,
                )
              }
            />
          </label>
          <label>
            <span className="field-label">Difficulty</span>
            <select
              value={card.difficulty ?? ""}
              onChange={(event) =>
                onUpdateCard(card.id, {
                  difficulty: (event.target.value || undefined) as Difficulty | undefined,
                })
              }
            >
              <option value="">Not Set</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <button className="button button--small button--danger" type="button" onClick={() => onDeleteCard(card.id)}>
            Delete
          </button>
          <div className="card-editor__move">
            <button
              className="button button--small button--ghost"
              type="button"
              aria-label={`Move ${card.prompt} Up`}
              onClick={() => onMoveCard(card.id, -1)}
            >
              ↑
            </button>
            <button
              className="button button--small button--ghost"
              type="button"
              aria-label={`Move ${card.prompt} Down`}
              onClick={() => onMoveCard(card.id, 1)}
            >
              ↓
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
