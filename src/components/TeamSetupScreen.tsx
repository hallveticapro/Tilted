import { useState } from "react";
import type { TeamSession } from "../types";
import { createTeamSession } from "../services/teamSession";
import { ScreenLayout } from "./ScreenLayout";

interface TeamSetupScreenProps {
  onStart: (session: TeamSession) => void;
  onBack: () => void;
}

export function TeamSetupScreen({ onStart, onBack }: TeamSetupScreenProps) {
  const [teams, setTeams] = useState([
    { name: "Team 1", players: "" },
    { name: "Team 2", players: "" },
  ]);
  const [totalRounds, setTotalRounds] = useState(6);
  const [targetScore, setTargetScore] = useState<number | null>(null);

  const updateTeam = (index: number, field: "name" | "players", value: string) =>
    setTeams((current) =>
      current.map((team, candidate) => (candidate === index ? { ...team, [field]: value } : team)),
    );

  return (
    <ScreenLayout
      title="Team Game"
      eyebrow="Local multiplayer"
      compact
      actions={<button className="button button--ghost" type="button" onClick={onBack}>Home</button>}
    >
      <section className="panel stack">
        <p className="muted setup-note">
          Pass one phone between teams. Tilted keeps score and rotates the next turn automatically.
        </p>
        <div className="stack">
          <div className="section-heading">
            <h2>Teams</h2>
            <button
              className="button button--small button--secondary"
              type="button"
              onClick={() =>
                setTeams((current) => [
                  ...current,
                  { name: `Team ${current.length + 1}`, players: "" },
                ])
              }
            >
              Add team
            </button>
          </div>
          {teams.map((team, index) => (
            <div className="team-name-row" key={index}>
              <input
                aria-label={`Team ${index + 1} name`}
                value={team.name}
                onChange={(event) => updateTeam(index, "name", event.target.value)}
              />
              <input
                aria-label={`${team.name || `Team ${index + 1}`} players`}
                placeholder="Optional players, comma separated"
                value={team.players}
                onChange={(event) => updateTeam(index, "players", event.target.value)}
              />
              {teams.length > 2 && (
                <button className="button button--small button--danger" type="button" onClick={() => setTeams((current) => current.filter((_, candidate) => candidate !== index))}>
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <label>
          <span className="field-label">Total rounds</span>
          <select value={totalRounds} onChange={(event) => setTotalRounds(Number(event.target.value))}>
            <option value="4">4 rounds</option>
            <option value="6">6 rounds</option>
            <option value="8">8 rounds</option>
            <option value="10">10 rounds</option>
          </select>
        </label>
        <label>
          <span className="field-label">Optional target score</span>
          <select value={targetScore ?? ""} onChange={(event) => setTargetScore(event.target.value ? Number(event.target.value) : null)}>
            <option value="">Play every round</option>
            <option value="10">First to 10</option>
            <option value="20">First to 20</option>
            <option value="30">First to 30</option>
          </select>
        </label>
        <button
          className="button button--primary button--large"
          type="button"
          disabled={teams.filter(({ name }) => name.trim()).length < 2}
          onClick={() =>
            onStart(
              createTeamSession(
                teams.map(({ name, players }) => ({
                  name,
                  players: players.split(","),
                })),
                totalRounds,
                targetScore,
              ),
            )
          }
        >
          Choose a Deck
        </button>
      </section>
    </ScreenLayout>
  );
}
