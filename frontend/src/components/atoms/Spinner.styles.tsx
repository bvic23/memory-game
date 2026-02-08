import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

export const SpinnerStyled = styled.span`
  width: var(--size-icon-m);
  height: var(--size-icon-m);
  border: var(--border-medium) solid var(--color-grey-medium);
  border-top-color: var(--color-bs-red);
  border-radius: var(--radius-round);
  animation: ${spin} var(--duration-spin) linear infinite;
`;
