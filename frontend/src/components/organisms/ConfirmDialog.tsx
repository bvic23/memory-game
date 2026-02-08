import { useCallback } from 'react';

import { Button } from '@/components/atoms/Button';
import { Label } from '@/components/atoms/Label';
import { Modal } from '@/components/atoms/Modal';

import { ActionsContainer } from '@/components/atoms/ActionsContainer';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onClose?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onClose,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const handleConfirm = useCallback(() => {
    onConfirm?.();
    onClose?.();
  }, [onConfirm, onClose]);

  const handleCancel = useCallback(() => {
    onCancel?.();
    onClose?.();
  }, [onCancel, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
    >
      <Label>{message}</Label>
      <ActionsContainer>
        <Button primary onClick={handleConfirm}>
          {confirmLabel}
        </Button>
        <Button onClick={handleCancel}>
          {cancelLabel}
        </Button>
      </ActionsContainer>
    </Modal>
  );
}
