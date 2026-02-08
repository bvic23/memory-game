import { useState, useEffect, useCallback, useMemo } from "react";
import { useGameApi } from "@/hooks/useGameApi";
import { getApiErrorMessage } from "@/types/errors";
import { executeFlip, FlipState, hideCards } from "@/utils/gameFlip";
import type { GameState, Settings } from "@/types/game";
import type { Card as CardType } from "@/types/game";
import { FLIP_ANIMATION_MS } from "@/constants";
import { delay } from "@/utils/delay";

export interface UseGameResult {
  state: GameState;
  settings: Settings | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  board: CardType[];
  refetch: () => void;
  resetErrors: () => void;
  flip: (cardId: string) => Promise<void>;
  restart: () => Promise<void>;
}

export function useGame(gameId: string): UseGameResult {
  if (!gameId || gameId.trim() === "") {
    throw new Error("Game ID is required");
  }

  const {
    game,
    restartGame,
    flipCard,
    error: apiError,
    isLoading,
    isFetching,
    refetch,
  } = useGameApi(gameId);

  if (!game) {
    throw new Error("Game not found");
  }

  const { settings, state, board } = game;
  const { flipBackDelayMs } = settings;

  const [localError, setLocalError] = useState<string | null>(null);
  const [visibleBoard, setVisibleBoard] = useState<CardType[]>(board);
  const [isWaitingForFlipBack, setIsWaitingForFlipBack] = useState(false);

  const reset = (error: string | null, waitingForFlipBack: boolean) => {
    setLocalError(error);
    setIsWaitingForFlipBack(waitingForFlipBack);
  };

  const resetErrors = useCallback(() => reset(null, false), []);

  const restart = useCallback(async () => {
    reset(null, false);
    try {
      await restartGame();
    } catch (err) {
      reset(getApiErrorMessage(err), false);
    }
  }, [restartGame]);

  const flip = useCallback(
    async (cardId: string) => {
      if (isWaitingForFlipBack) {
        return;
      }

      reset(null, true);

      const result = await executeFlip(board, cardId, flipCard);

      switch (result.type) {
        case FlipState.Done:
          reset(null, false);
          return;
        case FlipState.Error:
          reset(result.error, false);
          return;
        case FlipState.Mismatch:
          setVisibleBoard(result.board);
          await delay(flipBackDelayMs);

          setVisibleBoard(hideCards(result.board));
          // Avoid emojis disappearing before flip back animation
          await delay(FLIP_ANIMATION_MS);

          reset(null, false);
          // Refetch to get clean state (cards face-down)
          refetch();
          return;
      }
    },
    [board, flipCard, isWaitingForFlipBack, visibleBoard, refetch],
  );

  useEffect(() => {
    setVisibleBoard(board);
  }, [board]);

  const error = useMemo(
    () => localError ?? (apiError ? getApiErrorMessage(apiError) : null),
    [localError, apiError],
  );

  return {
    state,
    settings,
    isLoading,
    isFetching,
    error,
    board: visibleBoard,
    refetch,
    resetErrors,
    flip,
    restart,
  };
}
