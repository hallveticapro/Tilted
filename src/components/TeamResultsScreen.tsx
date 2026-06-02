import type { TeamSession } from "../types";
import { getSessionStandings } from "../services/teamSession";
import { ScreenLayout } from "./ScreenLayout";

interface TeamResultsScreenProps {
  session: TeamSession;
  onHome: () => void;
  onPlayAgain: () => void;
}

export function TeamResultsScreen({ session, onHome, onPlayAgain }: TeamResultsScreenProps) {
  const standings = getSessionStandings(session);
  return (
    <ScreenLayout title="Game Complete!" eyebrow={`${session.rounds.length} rounds played`}>
      <section className="score-card team-score-card">
        <p>Winning score</p>
        <strong>{standings[0]?.score ?? 0}</strong>
        <small>{standings[0]?.team.name ?? "No winner"}</small>
      </section>
      <ol className="standings-list panel">
        {standings.map(({ team, score }) => <li key={team.id}><span>{team.name}</span><strong>{score}</strong></li>)}
      </ol>
      <div className="button-row">
        <button className="button button--primary" type="button" onClick={onPlayAgain}>New Team Game</button>
        <button className="button button--ghost" type="button" onClick={onHome}>Home</button>
      </div>
    </ScreenLayout>
  );
}
