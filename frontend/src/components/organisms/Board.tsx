import { memo } from 'react';

import { Card } from '@/components/molecules/Card';
import type { Card as CardType } from '@/types/game';
import { Container } from './Board.styles';

export interface BoardProps {
  board: CardType[];
  onFlip: (cardId: string) => void;
  disabled?: boolean;
}

export const Board = memo(({ board, onFlip, disabled = false }: BoardProps) => (
  <Container>
    {board.map((card) => (
      <Card key={card.id} card={card} onClick={() => onFlip(card.id)} disabled={disabled} />
    ))}
  </Container>
));
