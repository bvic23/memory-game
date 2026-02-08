import { Container } from './Title.styles';

export interface TitleProps {
  children: React.ReactNode;
}

export const Title = ({ children }: TitleProps) => <Container>{children}</Container>;
