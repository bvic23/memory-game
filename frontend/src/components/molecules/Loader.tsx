import { Label } from '@/components/atoms/Label';
import { Spinner } from '@/components/atoms/Spinner';
import { Container } from './Loader.styles';

export interface LoaderProps {
  title: string;
}

export const Loader = ({ title }: LoaderProps) => (
  <Container>
    <Spinner />
    <Label>{title}</Label>
  </Container>
);
