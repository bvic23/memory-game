import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { Logo } from '@/components/atoms/Logo';
import { Modal } from '@/components/atoms/Modal';
import { SettingsForm } from '@/components/dialogs/settings-dialog/SettingsForm';
import { selectLastUsername } from '@/states/usernameSlice';
import { ScreenContainer } from '@/components/atoms/ScreenContainer';
import type { Game } from '@/types/game';

export const StartScreen = () => {
  const navigate = useNavigate();
  const lastUsername = useSelector(selectLastUsername);

  const handleSuccess = useCallback(
    (game: Game) => {
      navigate(`/game/${game.gameId}`);
    },
    [navigate]
  );

  const initialValues = lastUsername ? { userName: lastUsername } : undefined;

  return (
    <ScreenContainer>
      <Logo />
      <Modal isOpen title="Memory Game" >
        <SettingsForm
          initialValues={initialValues}
          onSuccess={handleSuccess}
          submitLabel="Start game"
        />
      </Modal>
    </ ScreenContainer>
  );
}
