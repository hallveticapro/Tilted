import type { Deck } from "../../types";

interface DeckDetailsPanelProps {
  selectedDeck: Deck;
  shareMessage: string | null;
  onDeleteDeck: (deck: Deck) => void;
  onExportCsv: () => void;
  onExportJson: () => void;
  onShareDeck: () => void;
  onUpdateDeck: (partial: Partial<Deck>, deferred?: boolean) => void;
}

export function DeckDetailsPanel({
  selectedDeck,
  shareMessage,
  onDeleteDeck,
  onExportCsv,
  onExportJson,
  onShareDeck,
  onUpdateDeck,
}: DeckDetailsPanelProps) {
  return (
    <section className="panel stack">
      <label>
        <span className="field-label">Deck Name</span>
        <input
          value={selectedDeck.name}
          onChange={(event) => onUpdateDeck({ name: event.target.value }, true)}
        />
      </label>
      <label>
        <span className="field-label">Optional Category</span>
        <input
          value={selectedDeck.category ?? ""}
          onChange={(event) => onUpdateDeck({ category: event.target.value }, true)}
        />
      </label>
      <label>
        <span className="field-label">Optional Description</span>
        <textarea
          value={selectedDeck.description ?? ""}
          onChange={(event) => onUpdateDeck({ description: event.target.value }, true)}
        />
      </label>
      <div className="button-row">
        <button className="button button--secondary" type="button" onClick={onExportJson}>
          Export JSON
        </button>
        <button className="button button--secondary" type="button" onClick={onExportCsv}>
          Export CSV
        </button>
        <button className="button button--secondary" type="button" onClick={onShareDeck}>
          Share Deck
        </button>
        <button className="button button--danger" type="button" onClick={() => onDeleteDeck(selectedDeck)}>
          Delete Deck
        </button>
      </div>
      <p className="muted share-message">
        Share links include the full deck content. Only share classroom decks with people who should
        be able to see every prompt and hint.
      </p>
      {shareMessage && <p className="muted share-message">{shareMessage}</p>}
    </section>
  );
}
