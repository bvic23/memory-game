import { IconButton } from '@/components/atoms/IconButton';
import { Separator } from '@/components/atoms/Separator';
import { Container } from './Actions.styles';

export interface ActionsProps {
  onOpenSettings: () => void;
  onRestart?: () => void;
}

export const Actions = ({
  onOpenSettings,
  onRestart,
}: ActionsProps) => (
  <Container>
    <IconButton onClick={onOpenSettings} icon="fa-gear" />
    <Separator />
    <IconButton onClick={onRestart} icon="fa-repeat" />
  </Container>
);
