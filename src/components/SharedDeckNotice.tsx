import type { SharedDeckReadResult } from "../services/deckSharing";

interface SharedDeckNoticeProps {
  importResult: SharedDeckReadResult;
  onImport: () => void;
  onDismiss: () => void;
}

export function SharedDeckNotice({ importResult, onImport, onDismiss }: SharedDeckNoticeProps) {
  if (importResult.status === "ok") {
    return (
      <section className="notice notice--warning shared-deck-notice" aria-label="Shared deck import">
        <p>Import the shared deck "{importResult.deck.name}"?</p>
        <div className="button-row">
          <button className="button button--small button--primary" type="button" onClick={onImport}>
            Import Shared Deck
          </button>
          <button className="button button--small button--ghost" type="button" onClick={onDismiss}>
            Dismiss
          </button>
        </div>
      </section>
    );
  }

  if (importResult.status === "error") {
    return (
      <section className="notice notice--warning shared-deck-notice" role="alert">
        <p>{importResult.message}</p>
        <button className="button button--small button--ghost" type="button" onClick={onDismiss}>
          Dismiss
        </button>
      </section>
    );
  }

  return null;
}
