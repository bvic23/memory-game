import styled from 'styled-components';
import { BREAKPOINTS } from '@/constants';

export const ScreenContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100%;
  gap: var(--space-md-d);

  @media (min-width: ${BREAKPOINTS.desktop}) {
    max-width: var(--content-max-width);
    margin-left: auto;
    margin-right: auto;
    width: 100%;
  }
`;
