import styled from 'styled-components';

export const Container = styled.h3<{ $noPadding?: boolean }>`
  font-family: var(--font-family);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  color: var(--color-black);
  margin: 0;
  padding: ${({ $noPadding }) => ($noPadding ? '0' : '0 var(--space-sm)')};
`;
