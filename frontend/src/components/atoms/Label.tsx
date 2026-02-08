import { Container } from './Label.styles';

export interface LabelProps {
  children: React.ReactNode;
  noPadding?: boolean;
}

export const Label = ({ children, noPadding = false }: LabelProps) => (
  <Container $noPadding={noPadding}>
    {children}
  </Container>
)
