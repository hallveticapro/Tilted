import type { TeamSession } from "../types";
import { getActivePlayer, getActiveTeam, getSessionStandings } from "../services/teamSession";
import { ScreenLayout } from "./ScreenLayout";

interface TeamTurnScreenProps {
  session: TeamSession;
  onReady: () => void;
  onQuit: () => void;
}

export function TeamTurnScreen({ session, onReady, onQuit }: TeamTurnScreenProps) {
  const team = getActiveTeam(session);
  const player = getActivePlayer(session);
  return (
    <ScreenLayout title={`${team.name}'s turn`} eyebrow={`Round ${session.rounds.length + 1} of ${session.totalRounds}`} compact>
      <section className="panel stack team-turn-card">
        <p>
          Hand the phone to <strong>{player}</strong> from <strong>{team.name}</strong>, then
          continue when they are ready.
        </p>
        <ol className="standings-list">
          {getSessionStandings(session).map(({ team: standingTeam, score }) => (
            <li key={standingTeam.id}><span>{standingTeam.name}</span><strong>{score}</strong></li>
          ))}
        </ol>
        <button className="button button--primary button--large" type="button" onClick={onReady}>Set Up Round</button>
        <button className="button button--danger" type="button" onClick={onQuit}>Quit Team Game</button>
      </section>
    </ScreenLayout>
  );
}
