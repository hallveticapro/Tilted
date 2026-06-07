import { useState } from "react";
import type { RoundResult } from "../types";
import { downloadText } from "../services/download";
import { exportHistoryCsv } from "../services/roundHistory";
import { ConfirmDialog } from "./ConfirmDialog";
import { ScreenLayout } from "./ScreenLayout";

interface HistoryScreenProps {
  history: RoundResult[];
  onClear: () => void;
  onBack: () => void;
}

export function HistoryScreen({ history, onClear, onBack }: HistoryScreenProps) {
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <ScreenLayout title="Round History" eyebrow="Recent games" actions={<button className="button button--ghost" type="button" onClick={onBack}>Home</button>}>
      <div className="button-row history-actions">
        <button className="button button--secondary" type="button" disabled={history.length === 0} onClick={() => downloadText(exportHistoryCsv(history), "tilted-round-history.csv", "text/csv")}>Export anonymous CSV</button>
        <button className="button button--danger" type="button" disabled={history.length === 0} onClick={() => setConfirmClear(true)}>Clear history</button>
      </div>
      {history.length === 0 ? <p className="empty-state">No rounds played yet.</p> : (
        <section className="history-list" aria-label="Round history">
          {history.map((round) => (
            <article className="panel history-card" key={round.id}>
              <div><strong>{round.deckName}</strong><small>{new Date(round.completedAt).toLocaleString()}</small></div>
              <div><span>{round.teamName ?? (round.gameMode === "teams" ? "Team game" : "Quick round")}</span><strong>{round.correctCards.length} correct</strong><small>{round.passedCards.length} passed</small></div>
            </article>
          ))}
        </section>
      )}
      {confirmClear && (
        <ConfirmDialog
          title="Clear all round history?"
          description="This removes saved round history from this browser."
          confirmLabel="Clear History"
          destructive
          onConfirm={() => {
            setConfirmClear(false);
            onClear();
          }}
          onCancel={() => setConfirmClear(false)}
        />
      )}
    </ScreenLayout>
  );
}
