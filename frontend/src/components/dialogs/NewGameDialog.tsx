import { ConfirmDialog } from '@/components/organisms/ConfirmDialog';

export interface NewGameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export const NewGameDialog = ({
  isOpen,
  onClose,
  onConfirm,
}: NewGameDialogProps) => (
  <ConfirmDialog
    isOpen={isOpen}
    title="Start new game"
    message="Changing these settings will start a new game. Your current game will be replaced."
    confirmLabel="Start new game"
    cancelLabel="Cancel"
    onClose={onClose}
    onConfirm={onConfirm}
  />
);
