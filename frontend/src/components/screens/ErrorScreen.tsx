import { ActionsContainer } from '@/components/atoms/ActionsContainer';
import { Button } from '@/components/atoms/Button';
import { Label } from '@/components/atoms/Label';
import { Logo } from '@/components/atoms/Logo';
import { ScreenContainer } from '@/components/atoms/ScreenContainer';
import { Title } from '@/components/atoms/Title';
import { Loader } from '@/components/molecules/Loader';
import { memo } from 'react';

export interface ErrorScreenProps {
  errorMessage: string;
  isRetrying: boolean;
  onRetry: () => void;
  onBack: () => void;
}

export const ErrorScreen = memo<ErrorScreenProps>(({
  errorMessage,
  isRetrying,
  onRetry,
  onBack: onBackToSettings,
}: ErrorScreenProps) => (
  <ScreenContainer>
    <Logo />
    {isRetrying ? (
      <Loader title="Retrying…" />
    ) : (
      <>
        <Title>Ooops, something happened</Title>
        <Label>{errorMessage}</Label>
        <ActionsContainer>
          <Button primary onClick={onRetry}>
            Retry
          </Button>
          <Button onClick={onBackToSettings}>
            Back to settings
          </Button>
        </ActionsContainer>
      </>
    )}
  </ScreenContainer>
));
