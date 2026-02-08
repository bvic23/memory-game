import styled from 'styled-components';

export const Container = styled.div`
  width: var(--size-icon-m);
  height: var(--size-icon-m);
  color: var(--color-grey-medium);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(--color-black);
  }

  i {
    font-size: var(--font-size-xl);
  }
`;
