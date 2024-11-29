import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Camera } from '../../types/camera';

interface CameraState {
  cameras: Camera[];
  loading: boolean;
  error: string | null;
  selectedCamera: Camera | null;
}

const initialState: CameraState = {
  cameras: [],
  loading: false,
  error: null,
  selectedCamera: null
};

export const cameraSlice = createSlice({
  name: 'cameras',
  initialState,
  reducers: {
    fetchCamerasStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCamerasSuccess: (state, action: PayloadAction<Camera[]>) => {
      state.loading = false;
      state.cameras = action.payload;
    },
    fetchCamerasFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    selectCamera: (state, action: PayloadAction<Camera>) => {
      state.selectedCamera = action.payload;
    }
  }
});

export const { 
  fetchCamerasStart, 
  fetchCamerasSuccess, 
  fetchCamerasFailure,
  selectCamera 
} = cameraSlice.actions;

export default cameraSlice.reducer; 