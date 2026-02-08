import { Container } from './IconButton.styles';

export interface IconButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  onClick?: () => void;
  icon: string;
}

export const IconButton = ({  onClick, icon }: IconButtonProps) => (
  <Container onClick={onClick}>
    <i className={`fa-solid ${icon}`} />
  </Container>
);
