import { configureStore } from '@reduxjs/toolkit';
import { gamesApi } from '@/apis/gamesApi';
import { presetsReducer } from '@/states/presetsSlice';
import { usernameReducer } from '@/states/usernameSlice';

export const store = configureStore({
  reducer: {
    [gamesApi.reducerPath]: gamesApi.reducer,
    presets: presetsReducer,
    username: usernameReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(gamesApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
