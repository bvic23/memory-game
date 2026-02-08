import { useCallback } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { ErrorScreen } from '@/components/screens/ErrorScreen';
import { LoadingScreen } from '@/components/screens/LoadingScreen';
import { GameView } from '@/components/screens/game-screen/GameView';
import { useGameApi } from '@/hooks/useGameApi';
import { getApiErrorMessage } from '@/types/errors';
import { Game } from '@/types/game';

/**
 * Route handler for /game/:gameId.
 * Resolves gameId from URL, navigates to / if missing, and renders GameView with navigation callbacks.
 */
export const GameScreen = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { game, isFetching, error, refetch } = useGameApi(gameId ?? '');

  const onNewGame = useCallback((game: Game) =>
    navigate(`/game/${game.gameId}`, { replace: true }),
    [navigate]);

  const onBackToSettings = useCallback(() =>
    navigate('/'),
    [navigate]);

  if (!gameId) {
    return <Navigate to="/" replace />;
  }

  // Show loading screen only on initial load (no game data yet)
  // During gameplay, allow background refetches without blocking the UI
  if (isFetching && !game) {
    return (
      <LoadingScreen />
    );
  }

  if (error || !game) {
    return (
      <ErrorScreen
        errorMessage={error ? getApiErrorMessage(error) : 'Failed to load.'}
        isRetrying={isFetching}
        onRetry={refetch}
        onBack={onBackToSettings}
      />
    );
  }

  return (
    <GameView
      gameId={gameId!}
      onNewGame={onNewGame}
      onBackToSettings={onBackToSettings}
    />
  );
}
