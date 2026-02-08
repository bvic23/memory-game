import { memo, useCallback, useEffect } from 'react';

import { ScreenContainer } from '@/components/atoms/ScreenContainer';
import { ErrorDialog } from '@/components/dialogs/ErrorDialog';
import { GameOverDialog } from '@/components/dialogs/GameOverDialog';
import { RestartDialog } from '@/components/dialogs/RestartDialog';
import { SettingsDialog } from '@/components/dialogs/settings-dialog/SettingsDialog';
import { Board } from '@/components/organisms/Board';
import { StatsBar } from '@/components/organisms/StatsBar';
import { FLIP_ANIMATION_MS } from '@/constants';
import { useGame } from '@/hooks/useGame';
import { useModal } from '@/hooks/useModal';
import type { Game } from '@/types/game';
import { delay } from '@/utils/delay';
import { getCssToken, msTransformer } from '@/utils/getCssToken';

export interface GameViewProps {
  gameId: string;
  onNewGame: (game: Game) => void;
  onBackToSettings: () => void;
}

const modalFadeDuration = getCssToken("--duration-modal-fade", msTransformer);

export const GameView = memo(({
  gameId,
  onNewGame,
  onBackToSettings,
}: GameViewProps) => {
  const {
    state,
    settings,
    error,
    isLoading,
    board,
    refetch,
    resetErrors,
    restart,
    flip,
  } = useGame(gameId);

  const settingsModal = useModal();
  const restartConfirmModal = useModal();
  const gameOverModal = useModal();

  // Game is guaranteed to be loaded by this point
  const { status } = state!;

  const isPlaying = status === 'playing';
  const isGameOver = status === 'won' || status === 'lost';

  const openSettings = useCallback(() => {
    refetch();
    settingsModal.open();
  }, [refetch, settingsModal.open]);

  useEffect(() => {
    if (!isGameOver) {
      return;
    }
    setTimeout(() => {
      gameOverModal.open();
    }, FLIP_ANIMATION_MS);

  }, [isGameOver, gameOverModal.open]);

  const handleRestart = useCallback(async () => {
    if (isGameOver) {
      gameOverModal.close();
      // Wait for modal to animate out before change game state
      await delay(modalFadeDuration);
      await restart();
    } else {
      restartConfirmModal.open();
    }
  }, [isGameOver, gameOverModal.close, restart, restartConfirmModal.open]);

  const faceUpCount = board.filter(c => c.isFaceUp).length;
  const isBoardDisabled = !isPlaying || isLoading || faceUpCount >= 2;

  return (
    <ScreenContainer>
      <StatsBar
        gameId={gameId}
        state={state!}
        board={board}
        settings={settings!}
        refetch={refetch}
        openSettings={openSettings}
        onRestart={handleRestart}
      />

      <Board
        board={board}
        onFlip={flip}
        disabled={isBoardDisabled}
      />

      <SettingsDialog
        isOpen={settingsModal.isVisible}
        onClose={settingsModal.close}
        onSave={onNewGame}
        settings={settings!}
        gameId={gameId}
      />

      <ErrorDialog
        isOpen={!!error}
        message={error ?? ''}
        onClose={resetErrors}
      />

      <GameOverDialog
        isOpen={gameOverModal.isVisible}
        status={isGameOver ? (status as 'won' | 'lost') : 'won'}
        onRestart={handleRestart}
        onNewGame={onBackToSettings}
      />

      <RestartDialog
        isOpen={restartConfirmModal.isVisible}
        onClose={restartConfirmModal.close}
        onConfirm={restart}
      />
    </ScreenContainer>
  );
});

