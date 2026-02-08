import { getApiErrorMessage } from "@/types/errors";
import type { Game } from "@/types/game";
import type { Card as CardType } from "@/types/game";

export type FlipResultData = Omit<Game, "settings">;

export type FlipCardResponse =
  | { data: FlipResultData }
  | { error: { status?: number; data?: unknown }; data?: undefined };

export enum FlipState {
  Noop = "noop",
  Done = "done",
  Error = "error",
  Mismatch = "mismatch",
}

export const hideCards = (board: CardType[]): CardType[] =>
  board.map((card) => (card.isMatched ? card : { ...card, isFaceUp: false }));

export const countMatchedPairs = (board: CardType[]): number =>
  board.filter((c) => c.isMatched).length / 2;

export const isMismatchedPair = (
  firstCardId: string,
  secondCardId: string,
  newBoard: CardType[],
  previousBoard: CardType[],
): boolean =>
  countMatchedPairs(newBoard) === countMatchedPairs(previousBoard) &&
  !newBoard.find((c) => c.id === firstCardId)?.isMatched &&
  !newBoard.find((c) => c.id === secondCardId)?.isMatched;

export type FlipResult =
  | { type: FlipState.Done } // success, no mismatch
  | { type: FlipState.Error; error: string } // API error or missing card
  | { type: FlipState.Mismatch; board: CardType[] };

export async function executeFlip(
  board: CardType[],
  cardId: string,
  flipCardApi: (cardId: string) => Promise<FlipCardResponse>,
): Promise<FlipResult> {
  try {
    const response = await flipCardApi(cardId);
    if ("error" in response && response.error) {
      return {
        type: FlipState.Error,
        error: getApiErrorMessage(response.error),
      };
    }

    const result = response.data;
    if (!result) {
      return { type: FlipState.Done };
    }

    const faceUpCard = board.find((card) => card.isFaceUp);
    // First card flip: success, cannot be a mismatch
    if (!faceUpCard) {
      return { type: FlipState.Done };
    }

    const isMismatch = isMismatchedPair(
      faceUpCard.id,
      cardId,
      result.board,
      board,
    );

    if (isMismatch && faceUpCard) {
      return {
        type: FlipState.Mismatch,
        board: result.board,
      };
    }

    return { type: FlipState.Done };
  } catch (err) {
    return { type: FlipState.Error, error: getApiErrorMessage(err) };
  }
}
