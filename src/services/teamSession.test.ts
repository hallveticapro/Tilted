import { describe, expect, it } from "vitest";
import { addTeamRound, createTeamSession, getActivePlayer, getActiveTeam, getSessionStandings, isTeamSessionComplete } from "./teamSession";
import type { RoundResult } from "../types";

function result(teamName: string, score: number, teamId?: string): RoundResult {
  const cards = Array.from({ length: score }, (_, index) => ({ id: `${teamName}-${index}`, prompt: `${index}` }));
  return { id: `${teamName}-${score}`, completedAt: new Date().toISOString(), deckId: "deck", deckName: "Deck", durationSeconds: 60, gameMode: "teams", teamId, teamName, outcomes: cards.map((card) => ({ card, outcome: "correct" })), correctCards: cards, passedCards: [] };
}

describe("teamSession", () => {
  it("rotates teams, accumulates scores, and completes at the target", () => {
    let session = createTeamSession(["Red", "Blue"], 6, 3);
    expect(getActiveTeam(session).name).toBe("Red");
    session = addTeamRound(session, result("Red", 2));
    expect(getActiveTeam(session).name).toBe("Blue");
    session = addTeamRound(session, result("Blue", 1));
    session = addTeamRound(session, result("Red", 1));
    expect(getSessionStandings(session)[0]).toMatchObject({ team: { name: "Red" }, score: 3 });
    expect(isTeamSessionComplete(session)).toBe(true);
  });

  it("rotates optional players within each team", () => {
    let session = createTeamSession(
      [
        { name: "Red", players: ["Rae", "Rin"] },
        { name: "Blue", players: ["Bea", "Bo"] },
      ],
      6,
      null,
    );
    expect(getActivePlayer(session)).toBe("Rae");
    session = addTeamRound(session, result("Red", 1));
    expect(getActivePlayer(session)).toBe("Bea");
    session = addTeamRound(session, result("Blue", 1));
    expect(getActivePlayer(session)).toBe("Rin");
  });

  it("keeps scores separate when teams use the same display name", () => {
    let session = createTeamSession(["Same", "Same"], 2, null);
    session = addTeamRound(session, result("Same", 2, session.teams[0].id));
    expect(getSessionStandings(session)).toEqual([
      { team: session.teams[0], score: 2 },
      { team: session.teams[1], score: 0 },
    ]);
  });
});
