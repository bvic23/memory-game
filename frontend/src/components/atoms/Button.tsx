import { Container } from './Button.styles';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  primary?: boolean;
  children: string;
  disabled?: boolean;
}

export const Button = ({ primary = false, children, disabled = false, ...props }: ButtonProps) => (
  <Container type="button" $primary={primary} disabled={disabled} {...props}>
    {children}
  </Container>
);
