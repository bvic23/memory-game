import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const PRESET_STORAGE_KEY = 'memory-game.selectedPresetId';

function getStoredPresetId(): string | null {
  try {
    const stored = localStorage.getItem(PRESET_STORAGE_KEY);
    return stored ?? null;
  } catch {
    return null;
  }
}

function setStoredPresetId(id: string | null): void {
  try {
    if (id === null) {
      localStorage.removeItem(PRESET_STORAGE_KEY);
    } else {
      localStorage.setItem(PRESET_STORAGE_KEY, id);
    }
  } catch {
    // ignore storage errors for now
  }
}

export interface PresetsState {
  selectedPresetId: string | null;
}

const initialState: PresetsState = {
  selectedPresetId: getStoredPresetId(),
};

export const presetsSlice = createSlice({
  name: 'presets',
  initialState,
  reducers: {
    setSelectedPreset: (state, action: PayloadAction<string>) => {
      state.selectedPresetId = action.payload;
      setStoredPresetId(action.payload);
    },
    clearSelectedPreset: (state) => {
      state.selectedPresetId = null;
      setStoredPresetId(null);
    },
  },
});

export const { setSelectedPreset, clearSelectedPreset } = presetsSlice.actions;
export const presetsReducer = presetsSlice.reducer;

export const selectSelectedPresetId = (state: { presets: PresetsState }) =>
  state.presets.selectedPresetId;
