import type { InputHTMLAttributes } from 'react';
import { StyledInput } from './InputText.styles';

export interface InputTextProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value'> {
  value?: string | number;
  wide?: boolean;
  error?: boolean;
}

export const InputText = ({
  wide,
  className,
  error,
  ...rest
}: InputTextProps) => (
  <StyledInput $wide={wide} className={className} $error={error} {...rest} />
);
