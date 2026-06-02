export type Difficulty = "easy" | "medium" | "hard";

export interface Card {
  id: string;
  prompt: string;
  answer?: string;
  category?: string;
  difficulty?: Difficulty;
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  category?: string;
  builtIn?: boolean;
  classroomSafe?: boolean;
  tags?: string[];
  subject?: string;
  ageRange?: string;
  cards: Card[];
}

export type GameMode = "quick" | "teams";
export type GameplayStyle = "forehead" | "review";
export type SensitivityPreset = "gentle" | "standard" | "deliberate";
export type DifficultyFilter = "all" | Difficulty;

export interface RoundSettings {
  deckId: string;
  durationSeconds: 30 | 60 | 90 | 120;
  motionEnabled: boolean;
  reverseTilt: boolean;
  tiltThreshold: number;
  sensitivityPreset: SensitivityPreset;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  gameplayStyle: GameplayStyle;
  difficultyFilter: DifficultyFilter;
  subcategoryFilter: string;
  cycleDeck: boolean;
  passLimit: number | null;
  fullscreenEnabled: boolean;
}

export type CardOutcome = "correct" | "pass";

export interface RoundCardResult {
  card: Card;
  outcome: CardOutcome;
}

export interface RoundResult {
  id: string;
  completedAt: string;
  deckId: string;
  deckName: string;
  durationSeconds: number;
  gameMode: GameMode;
  teamId?: string;
  teamName?: string;
  playerName?: string;
  outcomes: RoundCardResult[];
  correctCards: Card[];
  passedCards: Card[];
}

export interface Team {
  id: string;
  name: string;
  players: string[];
}

export interface TeamSession {
  id: string;
  teams: Team[];
  totalRounds: number;
  targetScore: number | null;
  rounds: RoundResult[];
}

export type MotionPermission =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unavailable"
  | "error";

export type MotionStatus =
  | "off"
  | "permission-needed"
  | "ready"
  | "waiting-for-forehead"
  | "calibrating"
  | "waiting-for-sample"
  | "calibrated"
  | "unavailable"
  | "denied"
  | "error";

export interface OrientationSample {
  axisValue: number;
  beta: number;
  gamma: number;
}

export interface TiltAction {
  id: number;
  outcome: CardOutcome;
}
