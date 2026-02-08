import { Button } from '@/components/atoms/Button';
import { Label } from '@/components/atoms/Label';
import { Modal } from '@/components/atoms/Modal';
import { ActionsContainer } from '@/components/atoms/ActionsContainer';

export interface ErrorDialogProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

export const ErrorDialog = ({
  isOpen,
  message,
  onClose,
}: ErrorDialogProps) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Error"
  >
    <div role="alert">
      <Label>{message}</Label>
    </div>
    <ActionsContainer>
      <Button primary onClick={onClose}>
        Dismiss
      </Button>
    </ActionsContainer>
  </Modal>
);
