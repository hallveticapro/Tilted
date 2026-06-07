import type { Deck } from "../../types";

interface ImportPanelsProps {
  csvImport: string;
  jsonImport: string;
  libraryImport: string;
  lineImport: string;
  selectedDeck: Deck | undefined;
  onCsvImportChange: (value: string) => void;
  onImportCsv: () => void;
  onImportJson: () => void;
  onImportLibrary: () => void;
  onImportLines: () => void;
  onJsonImportChange: (value: string) => void;
  onLibraryImportChange: (value: string) => void;
  onLineImportChange: (value: string) => void;
}

export function ImportPanels({
  csvImport,
  jsonImport,
  libraryImport,
  lineImport,
  selectedDeck,
  onCsvImportChange,
  onImportCsv,
  onImportJson,
  onImportLibrary,
  onImportLines,
  onJsonImportChange,
  onLibraryImportChange,
  onLineImportChange,
}: ImportPanelsProps) {
  return (
    <>
      {selectedDeck && (
        <>
          <section className="panel import-panel">
            <h2>Paste Cards</h2>
            <p className="muted">Add one prompt per line.</p>
            <textarea value={lineImport} onChange={(event) => onLineImportChange(event.target.value)} />
            <button className="button button--secondary" type="button" onClick={onImportLines}>
              Add Pasted Cards
            </button>
          </section>
          <section className="panel import-panel">
            <h2>Paste Card CSV</h2>
            <p className="muted">Use prompt, hint, category, and difficulty columns.</p>
            <textarea value={csvImport} onChange={(event) => onCsvImportChange(event.target.value)} />
            <button className="button button--secondary" type="button" onClick={onImportCsv}>
              Add CSV Cards
            </button>
          </section>
        </>
      )}
      <section className="panel import-panel">
        <h2>Import Deck JSON</h2>
        <textarea value={jsonImport} onChange={(event) => onJsonImportChange(event.target.value)} />
        <button className="button button--secondary" type="button" onClick={onImportJson}>
          Import JSON
        </button>
      </section>
      <section className="panel import-panel">
        <h2>Restore Deck Library</h2>
        <p className="muted">Import a whole-library JSON backup alongside your existing decks.</p>
        <textarea value={libraryImport} onChange={(event) => onLibraryImportChange(event.target.value)} />
        <button className="button button--secondary" type="button" onClick={onImportLibrary}>
          Import Library Backup
        </button>
      </section>
    </>
  );
}
