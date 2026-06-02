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
  cards: Card[];
}

export interface RoundSettings {
  deckId: string;
  durationSeconds: 30 | 60 | 90 | 120;
  motionEnabled: boolean;
  reverseTilt: boolean;
  tiltThreshold: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export type CardOutcome = "correct" | "pass";

export interface RoundCardResult {
  card: Card;
  outcome: CardOutcome;
}

export interface RoundResult {
  deckId: string;
  deckName: string;
  durationSeconds: number;
  correctCards: Card[];
  passedCards: Card[];
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
