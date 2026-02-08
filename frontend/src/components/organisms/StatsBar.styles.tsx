import styled from 'styled-components';
import { Logo as BaseLogo } from '@/components/atoms/Logo';
import { BREAKPOINTS } from '@/constants';

export const Container = styled.header`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
  min-height: var(--stats-bar-height);
  width: 100%;

  @media (max-width: ${BREAKPOINTS.tablet}) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    grid-template-areas: 'logo actions' 'stats stats';
    column-gap: var(--space-lg);
    row-gap: var(--space-sm);
  }

  @media (max-width: ${BREAKPOINTS.tablet}) {
    position: relative;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: var(--logo-height) auto;
    grid-template-areas: 'logo actions' 'stats stats';
  }

  @media (max-width: ${BREAKPOINTS.mobile}) {
    grid-template-rows: auto auto;
  }
`;

export const Logo = styled(BaseLogo)`
  @media (max-width: ${BREAKPOINTS.tablet}) {
    grid-area: logo;
  }

  @media (max-width: ${BREAKPOINTS.tablet}) {
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    top: var(--game-top-padding);
  }

  @media (max-width: ${BREAKPOINTS.mobile}) {
    position: static;
    transform: none;
  }
`;

export const TimeAndStatsWrapper = styled.div`
  @media (max-width: ${BREAKPOINTS.tablet}) {
    grid-area: stats;
    justify-self: center;
    width: max-content;
  }
`;

export const ActionsWrapper = styled.div`
  @media (max-width: ${BREAKPOINTS.tablet}) {
    grid-area: actions;
    justify-self: end;
    grid-column: 2;
  }
`;
