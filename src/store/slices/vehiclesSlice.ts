import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../services/supabase";
import type { Vehicle } from "../../types";

interface VehiclesState {
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
}

const initialState: VehiclesState = {
  vehicles: [],
  loading: false,
  error: null,
};

// Fetch all vehicles from Supabase
export const fetchVehicles = createAsyncThunk(
  "vehicles/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("createdAt", { ascending: false });

      if (error) throw error;
      return data as Vehicle[];
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch vehicles");
    }
  },
);

// Add a new vehicle
export const addVehicle = createAsyncThunk(
  "vehicles/add",
  async (
    vehicle: Omit<Vehicle, "id" | "createdAt" | "updatedAt">,
    { rejectWithValue },
  ) => {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("vehicles")
        .insert([{ ...vehicle, createdAt: now, updatedAt: now }])
        .select()
        .single();

      if (error) throw error;
      return data as Vehicle;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to add vehicle");
    }
  },
);

// Update vehicle (full update)
export const updateVehicle = createAsyncThunk(
  "vehicles/update",
  async (
    {
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<Vehicle, "id" | "createdAt" | "updatedAt">>;
    },
    { rejectWithValue },
  ) => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .update({ ...updates, updatedAt: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Vehicle;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update vehicle");
    }
  },
);

// Delete vehicle
export const deleteVehicle = createAsyncThunk(
  "vehicles/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase.from("vehicles").delete().eq("id", id);

      if (error) throw error;
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete vehicle");
    }
  },
);

// Update vehicle status
export const updateVehicleStatus = createAsyncThunk(
  "vehicles/updateStatus",
  async (
    {
      id,
      status,
      odometer,
    }: { id: string; status: Vehicle["status"]; odometer?: number },
    { rejectWithValue },
  ) => {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date().toISOString(),
      };

      if (odometer !== undefined) {
        updateData.currentOdometer = odometer;
      }

      const { data, error } = await supabase
        .from("vehicles")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Vehicle;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update vehicle");
    }
  },
);

const vehiclesSlice = createSlice({
  name: "vehicles",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch vehicles
    builder.addCase(fetchVehicles.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchVehicles.fulfilled, (state, action) => {
      state.loading = false;
      state.vehicles = action.payload;
    });
    builder.addCase(fetchVehicles.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Add vehicle
    builder.addCase(addVehicle.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addVehicle.fulfilled, (state, action) => {
      state.loading = false;
      state.vehicles.unshift(action.payload);
    });
    builder.addCase(addVehicle.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update vehicle
    builder.addCase(updateVehicle.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateVehicle.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.vehicles.findIndex((v) => v.id === action.payload.id);
      if (index !== -1) {
        state.vehicles[index] = action.payload;
      }
    });
    builder.addCase(updateVehicle.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete vehicle
    builder.addCase(deleteVehicle.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteVehicle.fulfilled, (state, action) => {
      state.loading = false;
      state.vehicles = state.vehicles.filter((v) => v.id !== action.payload);
    });
    builder.addCase(deleteVehicle.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update vehicle status
    builder.addCase(updateVehicleStatus.fulfilled, (state, action) => {
      const index = state.vehicles.findIndex((v) => v.id === action.payload.id);
      if (index !== -1) {
        state.vehicles[index] = action.payload;
      }
    });
  },
});

export const { clearError } = vehiclesSlice.actions;
export default vehiclesSlice.reducer;
