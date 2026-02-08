import { useCallback, useMemo } from 'react';

import { Modal } from '@/components/atoms/Modal';
import { SettingsForm } from '@/components/dialogs/settings-dialog/SettingsForm';
import type { Game, Settings } from '@/types/game';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (game: Game) => void;
  settings?: Settings | null;
  gameId?: string | undefined;
}

export const SettingsDialog = ({ isOpen, onClose, onSave, settings, gameId }: SettingsModalProps) => {
  const handleSuccess = useCallback(
    (newGame: Game) => {
      onSave(newGame);
      onClose();
    },
    [onSave, onClose]
  );

  const initialValues = useMemo(() => {
    if (!settings) {
      return undefined;
    }

    const { cardCount, userName, countdownSeconds, flipBackDelayMs, maxBadGuesses } = settings;

    return {
      userName,
      cardCount,
      countdownSeconds,
      flipBackDelayMs,
      maxBadGuesses: maxBadGuesses != null ? String(maxBadGuesses) : '',
    };
  }, [settings]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Game settings"
    >
      <SettingsForm
        key={isOpen ? gameId ?? 'new' : 'closed'}
        initialValues={initialValues}
        submitLabel="Save Settings"
        onSuccess={handleSuccess}
        gameId={gameId}
      />
    </Modal>
  );
}
