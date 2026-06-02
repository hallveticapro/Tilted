import type { RoundResult } from "../types";
import { downloadText } from "../services/download";
import { exportHistoryCsv } from "../services/roundHistory";
import { ScreenLayout } from "./ScreenLayout";

interface EndRoundScreenProps {
  result: RoundResult;
  onPlayAgain: () => void;
  onChooseDeck: () => void;
  onHome: () => void;
  onNextRound?: () => void;
  teamName?: string;
  bestScore?: number;
}

function ResultList({ title, cards }: { title: string; cards: RoundResult["correctCards"] }) {
  return (
    <section className="result-list">
      <h2>{title}</h2>
      {cards.length > 0 ? (
        <ul>
          {cards.map((card) => (
            <li key={card.id}>
              <span>{card.prompt}</span>
              {card.answer && card.answer !== card.prompt && <small>{card.answer}</small>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">None this round.</p>
      )}
    </section>
  );
}

export function EndRoundScreen({
  result,
  onPlayAgain,
  onChooseDeck,
  onHome,
  onNextRound,
  teamName,
  bestScore,
}: EndRoundScreenProps) {
  return (
    <ScreenLayout title="Round Complete!" eyebrow={result.deckName}>
      <section className="score-card">
        <p>Final score</p>
        <strong>{result.correctCards.length}</strong>
        <small>{result.passedCards.length} passed</small>
        {bestScore !== undefined && <small>Deck best: {bestScore}</small>}
      </section>
      <div className="button-row">
        {onNextRound ? (
          <button className="button button--primary" type="button" onClick={onNextRound}>Next Team</button>
        ) : (
          <button className="button button--primary" type="button" onClick={onPlayAgain}>Play Again</button>
        )}
        <button className="button button--secondary" type="button" onClick={onChooseDeck}>
          Choose Deck
        </button>
        <button className="button button--ghost" type="button" onClick={onHome}>
          Home
        </button>
        <button
          className="button button--ghost"
          type="button"
          onClick={() =>
            downloadText(exportHistoryCsv([result]), "tilted-round-result.csv", "text/csv")
          }
        >
          Export result
        </button>
      </div>
      {teamName && <p className="muted result-team-note">Scored for {teamName}.</p>}
      <section className="result-columns">
        <ResultList title="Correct cards" cards={result.correctCards} />
        <ResultList title="Passed cards" cards={result.passedCards} />
      </section>
    </ScreenLayout>
  );
}
