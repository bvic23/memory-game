import { Container } from './ToggleButton.styles';

export interface ToggleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  children: string;
}

export const ToggleButton = ({
  selected = false,
  children,
  type = 'button',
  ...props
}: ToggleButtonProps) => (
  <Container
    type={type}
    $selected={selected}
    {...props}
  >
    {children}
  </Container>
);
