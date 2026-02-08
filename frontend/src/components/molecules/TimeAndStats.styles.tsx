import styled from 'styled-components';
import { BREAKPOINTS } from '@/constants';

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
`;

export const StatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-xxs);
  padding: var(--space-xs) 0;
  min-height: var(--stats-bar-height);

  @media (max-width: ${BREAKPOINTS.tablet}) {
    align-self: auto;
  }
`;