import { memo } from 'react';
import { InputText } from '@/components/atoms/InputText';
import { Label } from '@/components/atoms/Label';
import {
  Container,
  Error,
  ErrorRow,
  MainRow,
} from './SettingRow.styles';

interface SettingRowProps {
  label: string;
  error?: string;
  type?: 'text' | 'number';
  value: string | number | undefined;
  onChange: (target: HTMLInputElement) => void;
  placeholder?: string;
  wide?: boolean;
}

const formatValue = (value: string | number | undefined) => {
  if (value === undefined || value === null) {
    return '';
  }
  if (typeof value === 'number' && Number.isNaN(value)) {
    return '';
  }
  return String(value);
};  

export const SettingRow = memo<SettingRowProps>(({
  label,
  error,
  type = 'number',
  value,
  onChange,
  placeholder,
  wide,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target);
  };

  return (
    <Container>
      <MainRow>
        <Label noPadding>{label}</Label>
        <InputText
          type={type}
          value={formatValue(value)}
          onChange={handleChange}
          placeholder={placeholder}
          wide={wide}
          error={!!error}
        />
      </MainRow>
      {error ? (
        <ErrorRow>
          <Error role="alert">
            {error}
          </Error>
        </ErrorRow>
      ) : null}
    </Container>
  );
});
