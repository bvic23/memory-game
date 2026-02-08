import styled from 'styled-components';

export const Container = styled.button<{ $selected?: boolean }>`
  min-height: var(--size-icon-m);
  padding: 0 var(--font-size-base);
  border-radius: var(--radius-card);
  border: var(--border-thin) solid var(--color-grey-medium);
  background: ${({ $selected }) =>
    $selected ? 'var(--color-grey-light)' : 'var(--color-white)'};
  font-family: var(--font-family);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-lg);
  color: ${({ $selected }) =>
    $selected ? 'var(--color-white)' : 'var(--color-black)'};
  cursor: pointer;

  &:hover {
    background: var(--color-grey-light);
  }

  &:focus-visible {
    outline: var(--outline) solid var(--color-bs-red);
    outline-offset: var(--outline-offset);
  }
`;
