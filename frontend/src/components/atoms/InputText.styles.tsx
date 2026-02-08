import styled from 'styled-components';

export const StyledInput = styled.input<{ $wide?: boolean, $error?: boolean  }>`
  width: ${({ $wide }) => ($wide ? 'var(--input-width-wide)' : 'var(--input-width)')};
  height: var(--input-height);
  border-radius: var(--radius-card);
  padding: ${({ $wide }) => ($wide ? 'var(--space-sm) var(--space-sm)' : 'var(--space-sm) 0')};
  border: var(--border-thin) solid ${({ $error }) => ($error ? 'var(--color-bs-red)' : 'var(--color-grey-medium)')};
  background-color: var(--color-white);
  font-family: var(--font-family);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-lg);
  text-align: ${({ $wide }) => ($wide ? 'left' : 'center')};
  box-sizing: border-box;
  -moz-appearance: textfield;
  appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:focus {
    outline: var(--outline) solid var(--color-bs-red);
    outline-offset: var(--outline-offset);
  }
`;
