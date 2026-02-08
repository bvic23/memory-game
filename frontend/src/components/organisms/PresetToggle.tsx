import { memo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Label } from '@/components/atoms/Label';
import { Toggle } from '@/components/molecules/Toggle';
import { selectSelectedPresetId, setSelectedPreset } from '@/states/presetsSlice';
import { PRESETS, Preset } from '@/constants';

export interface PresetToggleProps {
  onPresetApply: (preset: Preset) => void;
}

export const PresetToggle = memo<PresetToggleProps>(({ onPresetApply }) => {
  const dispatch = useDispatch();
  const selectedPresetId = useSelector(selectSelectedPresetId);

  const handlePresetSelect = useCallback(
    (id: string) => {
      const preset = PRESETS.find((p) => p.id === id);
      if (!preset) return;
      
      dispatch(setSelectedPreset(id));
      onPresetApply(preset);
    },
    [dispatch, onPresetApply]
  );

  return (
    <>
      <Label>Difficulty presets</Label>
      <Toggle
        options={PRESETS}
        selectedId={selectedPresetId}
        onSelect={handlePresetSelect}
      />
    </>
  );
});
