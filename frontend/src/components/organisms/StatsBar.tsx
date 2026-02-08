import { memo, useMemo } from 'react';

import { Actions } from '@/components/molecules/Actions';
import { TimeAndStats } from '@/components/molecules/TimeAndStats';
import { useGameTimer } from '@/hooks/useGameTimer';
import { countMatchedPairs } from '@/utils/gameFlip';
import type { Card, GameState, Settings } from '@/types/game';
import {
  ActionsWrapper,
  Container,
  Logo,
  TimeAndStatsWrapper,
} from './StatsBar.styles';

export interface StatsBarProps {
  gameId: string;
  state: GameState;
  board: Card[];
  settings: Settings;
  refetch: () => void;
  openSettings: () => void;
  onRestart?: () => void;
}

export const StatsBar = memo(({
  gameId,
  state,
  board,
  settings,
  refetch,
  openSettings,
  onRestart,
}: StatsBarProps) => {
  const { badGuesses, turns } = state;
  const matchedPairs = useMemo(() => countMatchedPairs(board), [board]);
  const { maxBadGuesses } = settings;

  const wsTimer = useGameTimer(
    gameId, 
    refetch,
    state.startedAt,
  );

  const livesLeft = useMemo(() => maxBadGuesses != null && maxBadGuesses > 0
    ? Math.max(0, maxBadGuesses - badGuesses)
    : null, [maxBadGuesses, badGuesses]);

  return (
    <Container>
      <Logo />
      <TimeAndStatsWrapper>
        <TimeAndStats
          remaining={wsTimer?.displayedSeconds ?? 0}
          matchedPairs={matchedPairs}
          badGuesses={badGuesses}
          livesLeft={livesLeft}
          turns={turns}
        />
      </TimeAndStatsWrapper>
      <ActionsWrapper>
        <Actions
          onOpenSettings={openSettings}
          onRestart={onRestart}
        />
      </ActionsWrapper>
    </Container>
  );
});
