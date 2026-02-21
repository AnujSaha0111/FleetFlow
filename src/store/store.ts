import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import vehiclesReducer from "./slices/vehiclesSlice";
import driversReducer from "./slices/driversSlice";
import tripsReducer from "./slices/tripsSlice";
import maintenanceReducer from "./slices/maintenanceSlice";
import fuelLogsReducer from "./slices/fuelLogsSlice";
import expensesReducer from "./slices/expensesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    vehicles: vehiclesReducer,
    drivers: driversReducer,
    trips: tripsReducer,
    maintenance: maintenanceReducer,
    fuelLogs: fuelLogsReducer,
    expenses: expensesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable for Firebase compatibility
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
