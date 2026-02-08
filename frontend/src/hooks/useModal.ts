import { useState, useCallback } from 'react';

export interface ModalHook {
  open: () => void;
  close: () => void;
  isVisible: boolean;
}

export function useModal(initialVisible = false): ModalHook {
  const [isVisible, setIsVisible] = useState(initialVisible);

  const open = useCallback(() => setIsVisible(true), []);
  const close = useCallback(() => setIsVisible(false), []);

  return { open, close, isVisible };
}
