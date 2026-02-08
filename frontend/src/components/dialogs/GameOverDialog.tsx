import { useCallback } from 'react';

import { ConfirmDialog } from '@/components/organisms/ConfirmDialog';

export type GameOverStatus = 'won' | 'lost';

export interface GameOverDialogProps {
  isOpen: boolean;
  status: GameOverStatus;
  onClose?: () => void;
  onRestart?: () => void;
  onNewGame?: () => void;
}

export const GameOverDialog = ({
  isOpen,
  status,
  onClose,
  onRestart,
  onNewGame,
}: GameOverDialogProps) => {
  const isWon = status === 'won';
  const title = isWon ? 'You won!' : "You lost!";
  const message = isWon
    ? 'Congratulations! All pairs matched.'
    : "Time's up or no mistakes left.";

  const handleNewGame = useCallback(() => {
    onNewGame?.();
    onClose?.();
  }, [onNewGame, onClose]);

  const handleRestart = useCallback(() => {
    onRestart?.();
    onClose?.();
  }, [onRestart, onClose]);

  return (
    <ConfirmDialog
      isOpen={isOpen}
      title={title}
      message={message}
      confirmLabel="Restart"
      cancelLabel="New game"
      onConfirm={handleRestart}
      onClose={onClose}
      onCancel={handleNewGame}
    />
  );
};
