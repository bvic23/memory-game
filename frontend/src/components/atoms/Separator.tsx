import { Container } from './Separator.styles';

export interface SeparatorProps {
  direction?: 'vertical' | 'horizontal';
}

export const Separator = ({ direction = 'vertical' }: SeparatorProps) => (
  <Container $direction={direction} />
);
