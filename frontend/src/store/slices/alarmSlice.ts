import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AlarmPanel } from '../../types/alarm';

interface AlarmState {
  panels: AlarmPanel[];
  selectedPanel: AlarmPanel | null;
  loading: boolean;
  error: string | null;
}

const initialState: AlarmState = {
  panels: [],
  selectedPanel: null,
  loading: false,
  error: null
};

const alarmSlice = createSlice({
  name: 'alarms',
  initialState,
  reducers: {
    fetchPanelsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPanelsSuccess: (state, action: PayloadAction<AlarmPanel[]>) => {
      state.loading = false;
      state.panels = action.payload;
    },
    fetchPanelsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    selectPanel: (state, action: PayloadAction<AlarmPanel>) => {
      state.selectedPanel = action.payload;
    }
  }
});

export const { 
  fetchPanelsStart, 
  fetchPanelsSuccess, 
  fetchPanelsFailure,
  selectPanel 
} = alarmSlice.actions;

export default alarmSlice.reducer; 