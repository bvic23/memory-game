import styled from 'styled-components';

export const ModalOverlay = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  background: var(--color-overlay);
  display: flex;
  justify-content: center;
  padding-top: var(--modal-top-padding);
  z-index: var(--z-modal);
  align-items: flex-start;
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  visibility: ${({ $open }) => ($open ? 'visible' : 'hidden')};
  pointer-events: ${({ $open }) => ($open ? 'auto' : 'none')};
  transition: opacity var(--duration-modal-fade) ease-out, visibility var(--duration-modal-fade) ease-out;
`;

export const ModalPanel = styled.div<{ $open: boolean }>`
  width: var(--modal-width);
  background: var(--color-white);
  border-radius: var(--radius-modal);
  overflow: hidden;
  box-shadow: var(--shadow-modal);
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transition: opacity var(--duration-modal-fade) ease-out, transform var(--duration-modal-fade) ease-out;
`;

export const ModalHeader = styled.header<{ $centerTitle?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: ${({ $centerTitle }) => ($centerTitle ? 'center' : 'space-between')};
  align-items: center;
  padding: var(--modal-padding);
  background-color: var(--color-grey-light);
`;

export const DialogContent = styled.div`
  width: var(--modal-width);
  padding: var(--modal-padding);
  background: var(--color-white);
  text-align: center;
`;