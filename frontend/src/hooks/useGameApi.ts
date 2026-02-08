import {
  useGetGameQuery,
  useFlipCardMutation,
  useRestartGameMutation,
} from "@/apis/gamesApi";
import { FlipCardResponse } from "@/utils/gameFlip";

export function useGameApi(gameId: string) {
  if (!gameId || gameId.trim() === '') {
    throw new Error('Game ID is required');
  }

  const gameQuery = useGetGameQuery(gameId);
  const [flipCardMutation, { isLoading: isFlipping }] = useFlipCardMutation();
  const [restartGameMutation] = useRestartGameMutation();

  const isLoading = gameQuery.isLoading || isFlipping;

  return {
    game: gameQuery.data,
    isLoading,
    isFetching: gameQuery.isFetching || gameQuery.isLoading,
    error: gameQuery.error,
    refetch: gameQuery.refetch,
    flipCard: (cardId: string) =>
      flipCardMutation({ gameId, cardId: cardId }) as Promise<FlipCardResponse>,
    restartGame: () => restartGameMutation(gameId),
  };
}
