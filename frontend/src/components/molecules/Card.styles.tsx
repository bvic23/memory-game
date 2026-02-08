import { FLIP_ANIMATION_MS } from '@/constants';
import styled from 'styled-components';

export const Base = styled.div`
  border-radius: var(--radius-card);
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-white);
  box-shadow: var(--shadow-card);
`;

export const BackFace = styled(Base)`
  background-position: center;
  background-image: url('/assets/card-bg.svg');
`;

export const FrontFace = styled(Base)`
  transform: rotateY(180deg) translateZ(1px);
  isolation: isolate;
  border: var(--border-thin) solid var(--color-grey-medium);
  position: absolute;

  &::before {
    content: '';
    position: absolute;
    inset: var(--space-xs);
    border-radius: var(--radius-card-inner);
    background: linear-gradient(180deg, var(--color-card-shine-start) 0%, var(--color-card-shine-end) 100%);
  }

`;

export const Flip = styled.div`
  position: absolute;
  inset: 0;
  perspective: var(--perspective-card);
  pointer-events: none;
`;

export const FlipInner = styled.div<{ $isFront: boolean }>`
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform ${FLIP_ANIMATION_MS}ms ease;
  border-radius: var(--radius-card);
  transform: ${({ $isFront }) => ($isFront ? 'rotateY(180deg)' : 'none')};
`;

export const Container = styled.div<{ $disabled: boolean }>`
  width: var(--card-width);
  height: var(--card-height);
  position: relative;
  flex-shrink: 0;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  border-radius: var(--radius-card);

  &:focus-visible {
    outline: none;
  }

  &:focus-visible ${BackFace},
  &:focus-visible ${FrontFace} {
    outline: var(--outline) solid var(--color-black);
    outline-offset: var(--outline-offset);
  }

  ${({ $disabled }) => !$disabled && `
    &:hover ${BackFace} {
      box-shadow: var(--shadow-card-hover);
      background-image: url('/assets/hovered-card-bg.svg');
    }
  `}
`;

export const Emoji = styled.span`
  width: var(--size-emoji);
  height: var(--size-emoji);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--size-emoji);
`;

