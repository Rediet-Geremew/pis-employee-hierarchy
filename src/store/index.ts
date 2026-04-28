import { configureStore } from '@reduxjs/toolkit';
import positionReducer from './positionSlice';

export const store = configureStore({
  reducer: {
    positions: positionReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;