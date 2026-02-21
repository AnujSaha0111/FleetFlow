import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../services/supabase";
import type { Driver } from "../../types";

interface DriversState {
  drivers: Driver[];
  loading: boolean;
  error: string | null;
}

const initialState: DriversState = {
  drivers: [],
  loading: false,
  error: null,
};

// Fetch all drivers
export const fetchDrivers = createAsyncThunk(
  "drivers/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .order("createdAt", { ascending: false });

      if (error) throw error;
      return data as Driver[];
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch drivers");
    }
  },
);

// Add a new driver
export const addDriver = createAsyncThunk(
  "drivers/add",
  async (
    driver: Omit<Driver, "id" | "createdAt" | "updatedAt">,
    { rejectWithValue },
  ) => {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("drivers")
        .insert([{ ...driver, createdAt: now, updatedAt: now }])
        .select()
        .single();

      if (error) throw error;
      return data as Driver;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to add driver");
    }
  },
);

// Update driver (full update)
export const updateDriver = createAsyncThunk(
  "drivers/update",
  async (
    {
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<Driver, "id" | "createdAt" | "updatedAt">>;
    },
    { rejectWithValue },
  ) => {
    try {
      const { data, error } = await supabase
        .from("drivers")
        .update({ ...updates, updatedAt: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Driver;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update driver");
    }
  },
);

// Delete driver
export const deleteDriver = createAsyncThunk(
  "drivers/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase.from("drivers").delete().eq("id", id);

      if (error) throw error;
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete driver");
    }
  },
);

const driversSlice = createSlice({
  name: "drivers",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch drivers
    builder.addCase(fetchDrivers.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDrivers.fulfilled, (state, action) => {
      state.loading = false;
      state.drivers = action.payload;
    });
    builder.addCase(fetchDrivers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Add driver
    builder.addCase(addDriver.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addDriver.fulfilled, (state, action) => {
      state.loading = false;
      state.drivers.unshift(action.payload);
    });
    builder.addCase(addDriver.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update driver
    builder.addCase(updateDriver.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateDriver.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.drivers.findIndex((d) => d.id === action.payload.id);
      if (index !== -1) {
        state.drivers[index] = action.payload;
      }
    });
    builder.addCase(updateDriver.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete driver
    builder.addCase(deleteDriver.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteDriver.fulfilled, (state, action) => {
      state.loading = false;
      state.drivers = state.drivers.filter((d) => d.id !== action.payload);
    });
    builder.addCase(deleteDriver.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError } = driversSlice.actions;
export default driversSlice.reducer;
