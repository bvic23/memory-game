import { ConfirmDialog } from '@/components/organisms/ConfirmDialog';

export interface RestartDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export const RestartDialog = ({
  isOpen,
  onClose,
  onConfirm,
}: RestartDialogProps) => (
  <ConfirmDialog
    isOpen={isOpen}
    title="Restart game?"
    message="Your progress will be lost. Are you sure you want to restart?"
    confirmLabel="Restart"
    cancelLabel="Cancel"
    onClose={onClose}
    onConfirm={onConfirm}
  />
);
