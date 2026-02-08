import { Container } from './Display.styles';

export interface DisplayProps {
  children: React.ReactNode;
}

export const Display = ({ children }: DisplayProps) =>
  <Container data-testid="reaminig-seconds-display">
    {children}
  </Container>;
