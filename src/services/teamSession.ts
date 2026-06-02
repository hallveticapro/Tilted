import type { RoundResult, Team, TeamSession } from "../types";
import { createId } from "../utils/id";

export interface TeamSetupInput {
  name: string;
  players: string[];
}

export function createTeamSession(
  teamInputs: string[] | TeamSetupInput[],
  totalRounds: number,
  targetScore: number | null,
): TeamSession {
  const teams: Team[] = teamInputs
    .map((input) =>
      typeof input === "string"
        ? { name: input.trim(), players: [] }
        : {
            name: input.name.trim(),
            players: input.players.map((player) => player.trim()).filter(Boolean),
          },
    )
    .filter(({ name }) => Boolean(name))
    .map(({ name, players }) => ({
      id: createId("team"),
      name,
      players: players.length > 0 ? players : [name],
    }));
  return {
    id: createId("session"),
    teams,
    totalRounds,
    targetScore,
    rounds: [],
  };
}

export function getActiveTeam(session: TeamSession): Team {
  return session.teams[session.rounds.length % session.teams.length];
}

export function getActivePlayer(session: TeamSession): string {
  const team = getActiveTeam(session);
  const turnsCompletedByTeam = Math.floor(session.rounds.length / session.teams.length);
  return team.players[turnsCompletedByTeam % team.players.length] ?? team.name;
}

export function getTeamScore(session: TeamSession, teamId: string): number {
  const team = session.teams.find((candidate) => candidate.id === teamId);
  return session.rounds.reduce(
    (score, round) =>
      round.teamId === teamId || (!round.teamId && round.teamName === team?.name)
        ? score + round.correctCards.length
        : score,
    0,
  );
}

export function getSessionStandings(session: TeamSession) {
  return session.teams
    .map((team) => ({ team, score: getTeamScore(session, team.id) }))
    .sort((left, right) => right.score - left.score);
}

export function addTeamRound(session: TeamSession, result: RoundResult): TeamSession {
  return { ...session, rounds: [...session.rounds, result] };
}

export function isTeamSessionComplete(session: TeamSession): boolean {
  return (
    session.rounds.length >= session.totalRounds ||
    (session.targetScore !== null &&
      getSessionStandings(session).some(({ score }) => score >= session.targetScore!))
  );
}
