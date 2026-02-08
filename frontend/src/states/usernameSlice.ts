import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const USERNAME_STORAGE_KEY = 'memory-game.lastUsername';

function getStoredUsername(): string {
  try {
    const stored = localStorage.getItem(USERNAME_STORAGE_KEY);
    return stored ?? '';
  } catch {
    return '';
  }
}

function setStoredUsername(username: string): void {
  try {
    if (username === '') {
      localStorage.removeItem(USERNAME_STORAGE_KEY);
    } else {
      localStorage.setItem(USERNAME_STORAGE_KEY, username);
    }
  } catch {
    // ignore storage errors
  }
}

export interface UsernameState {
  lastUsername: string;
}

const initialState: UsernameState = {
  lastUsername: getStoredUsername(),
};

export const usernameSlice = createSlice({
  name: 'username',
  initialState,
  reducers: {
    setLastUsername: (state, action: PayloadAction<string>) => {
      const value = action.payload.trim();
      state.lastUsername = value;
      setStoredUsername(value);
    },
    clearLastUsername: (state) => {
      state.lastUsername = '';
      setStoredUsername('');
    },
  },
});

export const { setLastUsername, clearLastUsername } = usernameSlice.actions;
export const usernameReducer = usernameSlice.reducer;

export const selectLastUsername = (state: { username: UsernameState }) =>
  state.username.lastUsername;
