import type { RoundResult } from "../types";
import { ScreenLayout } from "./ScreenLayout";

interface EndRoundScreenProps {
  result: RoundResult;
  onPlayAgain: () => void;
  onChooseDeck: () => void;
  onHome: () => void;
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
}: EndRoundScreenProps) {
  return (
    <ScreenLayout title="Round Complete!" eyebrow={result.deckName}>
      <section className="score-card">
        <p>Final score</p>
        <strong>{result.correctCards.length}</strong>
        <small>{result.passedCards.length} passed</small>
      </section>
      <div className="button-row">
        <button className="button button--primary" type="button" onClick={onPlayAgain}>
          Play Again
        </button>
        <button className="button button--secondary" type="button" onClick={onChooseDeck}>
          Choose Deck
        </button>
        <button className="button button--ghost" type="button" onClick={onHome}>
          Home
        </button>
      </div>
      <section className="result-columns">
        <ResultList title="Correct cards" cards={result.correctCards} />
        <ResultList title="Passed cards" cards={result.passedCards} />
      </section>
    </ScreenLayout>
  );
}
