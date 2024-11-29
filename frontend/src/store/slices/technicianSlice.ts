export interface TechnicianState {
    technicians: Technician[];
    loading: boolean;
    error: string | null;
}

// Agregar al rootReducer
const rootReducer = combineReducers({
    auth: authReducer,
    cameras: cameraReducer,
    alarms: alarmReducer,
    technicians: technicianReducer
}); 