import { Display } from '@/components/atoms/Display';
import { Label } from '@/components/atoms/Label';
import { Separator } from '@/components/atoms/Separator';
import { Container, StatsContainer } from './TimeAndStats.styles';

export interface TimeAndStatsProps {
  turns: number;
  remaining: number;
  matchedPairs: number;
  badGuesses: number;
  livesLeft: number | null;
}

export const TimeAndStats = ({ remaining, matchedPairs, badGuesses, livesLeft, turns }: TimeAndStatsProps) => (
  <Container>
    <Display>{remaining}</Display>
    <Separator />
    <StatsContainer>
      <Label>{turns} turns</Label>
      <Separator direction="horizontal" />
      <Label>{matchedPairs} matches</Label>
      <Separator direction="horizontal" />
      <Label>{badGuesses} mistakes</Label>
      {livesLeft !== null ? (
        <>
          <Separator direction="horizontal" />
          <Label>{livesLeft} mistakes left</Label>
        </>
      ) : null}
    </StatsContainer>
  </Container>
)
