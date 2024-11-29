import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import cameraSlice from './slices/cameraSlice';

export const store = configureStore({
    reducer: {
        auth: authSlice,
        cameras: cameraSlice
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const initialState = {
    auth: {
        user: null,
        token: null,
        loading: false,
        error: null
    },
    cameras: {
        cameras: [],
        selectedCamera: null,
        loading: false,
        error: null
    },
    // ... otros estados iniciales
}; 