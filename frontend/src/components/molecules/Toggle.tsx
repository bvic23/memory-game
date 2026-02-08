import { ToggleButton } from '@/components/atoms/ToggleButton';
import { Container } from './Toggle.styles';

export interface ToggleOption {
  id: string;
  label: string;
}

export interface ToggleProps {
  options: readonly ToggleOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const Toggle = ({
  options,
  selectedId,
  onSelect,
}: ToggleProps) => (
  <Container>
    {options.map(({ id, label }) => (
      <ToggleButton
        key={id}
        selected={selectedId === id}
        onClick={() => onSelect(id)}
      >
        {label}
      </ToggleButton>
    ))}
  </Container>
);
