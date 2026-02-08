import { Card } from '@/components/molecules/Card';
import type { Card as CardType } from '@/types/game';
import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';

describe('Card', () => {
  const faceDownCard: CardType = {
    id: 'card-1',
    isFaceUp: false,
    isMatched: false,
  };

  const faceUpCard: CardType = {
    id: 'card-2',
    isFaceUp: true,
    isMatched: false,
    emoji: '🐶',
  };

  it('calls onClick when face-down card is clicked', () => {
    const onClick = jest.fn();
    const { container } = render(<Card card={faceDownCard} onClick={onClick} />);
    fireEvent.click(container.firstChild as Element);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when face-up card is clicked', () => {
    const onClick = jest.fn();
    const { container } = render(<Card card={faceUpCard} onClick={onClick} />);
    fireEvent.click(container.firstChild as Element);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('disables click when disabled prop is true', () => {
    const onClick = jest.fn();
    const { container } = render(<Card card={faceDownCard} onClick={onClick} disabled />);
    const card = container.firstChild as Element;
    fireEvent.click(card);
    expect(onClick).not.toHaveBeenCalled();
  });
});
