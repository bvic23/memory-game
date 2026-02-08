import type { Card as CardType } from '@/types/game';
import {
  Container,
  Flip,
  FlipInner,
  BackFace,
  FrontFace,
  Emoji,
} from './Card.styles';

export interface CardProps {
  card: CardType;
  onClick: () => void;
  disabled?: boolean;
}

export const Card = ({ card, onClick, disabled = false }: CardProps) => {
  const isRevealed = card.isFaceUp || card.isMatched;
  const isInteractive = !isRevealed && !disabled;

  return (
    <Container
      $disabled={!isInteractive}
      onClick={isInteractive ? onClick : undefined}
    >
      <Flip>
        <FlipInner $isFront={isRevealed}>
          <BackFace />
          <FrontFace>
            <Emoji>{card.emoji}</Emoji>
          </FrontFace>
        </FlipInner>
      </Flip>
    </Container>
  );
};
