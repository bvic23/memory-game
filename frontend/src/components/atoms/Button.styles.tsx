import styled from 'styled-components';

export const Container = styled.button<{ $primary?: boolean, disabled?: boolean }>`
  height: var(--button-height);
  padding: 0 var(--space-md);
  font-family: var(--font-family);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-base);
  border: none;
  border-radius: var(--radius-button);
  cursor: pointer;
  background: ${({ $primary }) =>
    $primary ? 'var(--color-bs-red)' : 'var(--color-grey-light)'};
  color: ${({ $primary }) => ($primary ? 'var(--color-black)' : 'var(--color-white)')};

  &:hover {
    opacity: var(--opacity-hover);
  }

  &:focus {
    outline: var(--outline) solid var(--color-bs-red);
    outline-offset: var(--outline-offset);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: var(--opacity-disabled);
  }
  text-transform: uppercase;
`;
