import styled from 'styled-components';

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--space-sm-d);
`;

export const BackendError = styled.p`
  color: var(--color-bs-red);
  font-size: var(--font-size-base);
  margin-top: var(--space-xs);
`;
