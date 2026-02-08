export interface Card {
  id: string;
  isFaceUp: boolean;
  isMatched: boolean;
  emoji?: string;
}

export interface Settings {
  userName: string;
  cardCount: number;
  countdownSeconds: number;
  flipBackDelayMs: number;
  maxBadGuesses?: number | null;
}

export type GameStatus = "playing" | "won" | "lost";

export interface GameState {
  status: GameStatus;
  turns: number;
  badGuesses: number;
  remainingSeconds: number;
  startedAt: number;
}

export interface Game {
  gameId: string;
  board: Card[];
  settings: Settings;
  state: GameState;
}
