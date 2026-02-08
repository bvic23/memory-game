import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

export const MainRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-sm);
`;

export const ErrorRow = styled.div`
  margin-top: var(--space-xs);
  display: flex;
  justify-content: flex-end;
`;

export const Error = styled.span`
  font-size: var(--font-size-base);
  color: var(--color-bs-red);
`;
