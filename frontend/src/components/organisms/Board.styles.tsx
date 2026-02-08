import styled from 'styled-components';

export const Container = styled.div`
  background: var(--color-grey-light);
  padding: var(--space-lg);
  border-radius: var(--radius-board);
  display: grid;
  grid-template-columns: repeat(auto-fit, var(--card-width));
  gap: var(--space-sm);
  justify-content: center;
  align-content: start;
  width: 100%;
  border: 1px solid var(--color-grey-light);
`;
