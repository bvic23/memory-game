export interface CreateGameRequest {
  userName: string;
  cardCount: number;
  countdownSeconds: number;
  flipBackDelayMs: number;
  maxBadGuesses?: number | null;
}

export interface FlipRequest {
  cardId: string;
}
