import { Title } from '@/components/atoms/Title';
import { IconButton } from '@/components/atoms/IconButton';
import { DialogContent, ModalHeader, ModalOverlay, ModalPanel } from './Modal.styles';

export interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) => (
  <ModalOverlay
    $open={isOpen}
    onClick={onClose}
  >
    <ModalPanel $open={isOpen} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
      <ModalHeader $centerTitle={!onClose}>
        <Title>{title}</Title>
        {onClose ? (
          <IconButton onClick={onClose} icon="fa-xmark" />
        ) : null}
      </ModalHeader>
      <DialogContent>
        {children}
      </DialogContent>
    </ModalPanel>
  </ModalOverlay>
)
