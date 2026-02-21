import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../services/supabase";
import type { FuelLog } from "../../types";

interface FuelLogsState {
  fuelLogs: FuelLog[];
  loading: boolean;
  error: string | null;
}

const initialState: FuelLogsState = {
  fuelLogs: [],
  loading: false,
  error: null,
};

// Fetch all fuel logs
export const fetchFuelLogs = createAsyncThunk(
  "fuelLogs/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("fuel_logs")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      return data as FuelLog[];
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch fuel logs");
    }
  },
);

// Add new fuel log
export const addFuelLog = createAsyncThunk(
  "fuelLogs/add",
  async (
    fuelLogData: Omit<FuelLog, "id" | "createdAt">,
    { rejectWithValue },
  ) => {
    try {
      const { data, error } = await supabase
        .from("fuel_logs")
        .insert([fuelLogData])
        .select()
        .single();

      if (error) throw error;
      return data as FuelLog;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to add fuel log");
    }
  },
);

// Update fuel log
export const updateFuelLog = createAsyncThunk(
  "fuelLogs/update",
  async (
    { id, updates }: { id: string; updates: Partial<FuelLog> },
    { rejectWithValue },
  ) => {
    try {
      const { data, error } = await supabase
        .from("fuel_logs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as FuelLog;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update fuel log");
    }
  },
);

// Delete fuel log
export const deleteFuelLog = createAsyncThunk(
  "fuelLogs/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase.from("fuel_logs").delete().eq("id", id);

      if (error) throw error;
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete fuel log");
    }
  },
);

const fuelLogsSlice = createSlice({
  name: "fuelLogs",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch fuel logs
    builder.addCase(fetchFuelLogs.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchFuelLogs.fulfilled, (state, action) => {
      state.loading = false;
      state.fuelLogs = action.payload;
    });
    builder.addCase(fetchFuelLogs.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Add fuel log
    builder.addCase(addFuelLog.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addFuelLog.fulfilled, (state, action) => {
      state.loading = false;
      state.fuelLogs.unshift(action.payload);
    });
    builder.addCase(addFuelLog.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update fuel log
    builder.addCase(updateFuelLog.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateFuelLog.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.fuelLogs.findIndex(
        (log) => log.id === action.payload.id,
      );
      if (index !== -1) {
        state.fuelLogs[index] = action.payload;
      }
    });
    builder.addCase(updateFuelLog.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete fuel log
    builder.addCase(deleteFuelLog.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteFuelLog.fulfilled, (state, action) => {
      state.loading = false;
      state.fuelLogs = state.fuelLogs.filter(
        (log) => log.id !== action.payload,
      );
    });
    builder.addCase(deleteFuelLog.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError } = fuelLogsSlice.actions;
export default fuelLogsSlice.reducer;
