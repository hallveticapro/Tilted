import type { Deck } from "../types";
import { ConfirmDialog } from "./ConfirmDialog";
import { ScreenLayout } from "./ScreenLayout";
import { CardListSection } from "./deck-editor/CardListSection";
import { DeckDetailsPanel } from "./deck-editor/DeckDetailsPanel";
import { DeckSidebar } from "./deck-editor/DeckSidebar";
import { ImportPanels } from "./deck-editor/ImportPanels";
import { RecoveryNotice } from "./deck-editor/RecoveryNotice";
import { useDeckWorkshop } from "./deck-editor/useDeckWorkshop";

interface DeckEditorProps {
  customDecks: Deck[];
  onDecksChange: (decks: Deck[]) => void;
  onBack: () => void;
}

export function DeckEditor({ customDecks, onDecksChange, onBack }: DeckEditorProps) {
  const workshop = useDeckWorkshop({ customDecks, onDecksChange, onBack });
  const pendingDeckDelete = workshop.deckPendingDelete;

  return (
    <ScreenLayout
      title="Deck Workshop"
      eyebrow="Make review your own"
      actions={
        <button className="button button--ghost" type="button" onClick={workshop.done}>
          Done
        </button>
      }
    >
      {workshop.error && <p className="notice notice--warning">{workshop.error}</p>}
      {workshop.hasRecovery && (
        <RecoveryNotice
          onDiscardRecovery={workshop.discardRecovery}
          onDownloadRecovery={workshop.downloadRecovery}
        />
      )}
      <section className="editor-layout">
        <DeckSidebar
          allCategories={workshop.allCategories}
          workingDecks={workshop.workingDecks}
          selectedDeckId={workshop.selectedDeckId}
          seedCategories={workshop.seedCategories}
          seedCategory={workshop.seedCategory}
          visibleSeedDecks={workshop.visibleSeedDecks}
          onAddDeck={workshop.addDeck}
          onCopyDeck={workshop.addCopy}
          onExportLibrary={workshop.exportLibrary}
          onSelectDeck={workshop.selectDeck}
          onSelectSeedCategory={workshop.setSeedCategory}
        />

        <section className="editor-main">
          {workshop.selectedDeck ? (
            <>
              <DeckDetailsPanel
                selectedDeck={workshop.selectedDeck}
                shareMessage={workshop.shareMessage}
                onDeleteDeck={workshop.setDeckPendingDelete}
                onExportCsv={workshop.exportSelectedDeckCsv}
                onExportJson={workshop.exportSelectedDeckJson}
                onShareDeck={workshop.shareDeck}
                onUpdateDeck={workshop.updateSelectedDeck}
              />
              <CardListSection
                bulkCategory={workshop.bulkCategory}
                cardPage={workshop.cardPage}
                deletedCards={workshop.deletedCards}
                pageCount={workshop.pageCount}
                selectedCardIds={workshop.selectedCardIds}
                selectedDeck={workshop.selectedDeck}
                visibleCards={workshop.visibleCards}
                onAddCard={workshop.addCard}
                onBulkAssignCategory={workshop.bulkAssignCategory}
                onBulkDelete={workshop.bulkDelete}
                onDeleteCard={workshop.deleteCard}
                onMoveCard={workshop.moveCard}
                onSetBulkCategory={workshop.setBulkCategory}
                onSetCardPage={workshop.setCardPage}
                onToggleSelectedCard={workshop.toggleSelectedCard}
                onUndoDeleteCard={workshop.undoDeleteCard}
                onUpdateCard={workshop.updateCard}
                onUpdateDeck={workshop.updateSelectedDeck}
              />
            </>
          ) : (
            <section className="panel empty-state">
              Create a custom deck or copy a built-in deck to begin editing.
            </section>
          )}
          <ImportPanels
            csvImport={workshop.csvImport}
            jsonImport={workshop.jsonImport}
            libraryImport={workshop.libraryImport}
            lineImport={workshop.lineImport}
            selectedDeck={workshop.selectedDeck}
            onCsvImportChange={workshop.setCsvImport}
            onImportCsv={workshop.importCsv}
            onImportJson={workshop.importJson}
            onImportLibrary={workshop.importLibrary}
            onImportLines={workshop.importLines}
            onJsonImportChange={workshop.setJsonImport}
            onLibraryImportChange={workshop.setLibraryImport}
            onLineImportChange={workshop.setLineImport}
          />
        </section>
      </section>
      {pendingDeckDelete && (
        <ConfirmDialog
          title={`Delete "${pendingDeckDelete.name}"?`}
          description="This removes the custom deck from this browser."
          confirmLabel="Delete Deck"
          destructive
          onConfirm={() => workshop.deleteDeck(pendingDeckDelete)}
          onCancel={() => workshop.setDeckPendingDelete(null)}
        />
      )}
    </ScreenLayout>
  );
}
