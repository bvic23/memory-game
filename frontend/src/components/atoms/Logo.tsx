import { Logo as StyledLogo } from './Logo.styles';

export const Logo = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <StyledLogo src="/assets/logo.svg" alt="Memory Game" {...props} />
);
