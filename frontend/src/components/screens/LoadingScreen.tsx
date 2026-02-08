import { memo } from 'react';
import { Logo } from '@/components/atoms/Logo';
import { Loader } from '@/components/molecules/Loader';
import { ScreenContainer } from '@/components/atoms/ScreenContainer';

export interface LoadingScreenProps {
  title?: string;
}

export const LoadingScreen = memo<LoadingScreenProps>(({ title = 'Loading...' }) => (
  <ScreenContainer>
      <Logo />
      {title ? <Loader title={title} /> : null}
  </ScreenContainer>
));
