import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cameraReducer from './slices/cameraSlice';
import alarmReducer from './slices/alarmSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  cameras: cameraReducer,
  alarms: alarmReducer
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer; 