import styled from 'styled-components';

export const Container = styled.div<{ $direction: 'vertical' | 'horizontal' }>`
  background-color: var(--color-grey-medium);
  ${({ $direction }) =>
    $direction === 'vertical'
      ? `
    width: var(--border-thin);
    align-self: stretch;
  `
      : `
    height: var(--border-thin);
    width: 100%;
    min-width: 0;
  `}
`;
