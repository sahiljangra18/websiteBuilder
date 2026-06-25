import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import draftPageReducer from './slices/draftPageSlice';
import uiReducer from './slices/uiSlice';
import publishReducer from './slices/publishSlice';

export const store = configureStore({
  reducer: {
    draftPage: draftPageReducer,
    ui: uiReducer,
    publish: publishReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
