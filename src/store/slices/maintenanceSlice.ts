import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../services/supabase";
import type { Maintenance } from "../../types";

interface MaintenanceState {
  maintenanceRecords: Maintenance[];
  loading: boolean;
  error: string | null;
}

const initialState: MaintenanceState = {
  maintenanceRecords: [],
  loading: false,
  error: null,
};

// Fetch all maintenance records
export const fetchMaintenance = createAsyncThunk(
  "maintenance/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("maintenance")
        .select("*")
        .order("createdAt", { ascending: false });

      if (error) throw error;
      return data as Maintenance[];
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to fetch maintenance records",
      );
    }
  },
);

// Add new maintenance record
export const addMaintenance = createAsyncThunk(
  "maintenance/add",
  async (
    maintenanceData: Omit<Maintenance, "id" | "createdAt" | "updatedAt">,
    { rejectWithValue },
  ) => {
    try {
      const { data, error } = await supabase
        .from("maintenance")
        .insert([maintenanceData])
        .select()
        .single();

      if (error) throw error;
      return data as Maintenance;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to add maintenance record",
      );
    }
  },
);

// Update maintenance record
export const updateMaintenance = createAsyncThunk(
  "maintenance/update",
  async (
    { id, updates }: { id: string; updates: Partial<Maintenance> },
    { rejectWithValue },
  ) => {
    try {
      const { data, error } = await supabase
        .from("maintenance")
        .update({ ...updates, updatedAt: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Maintenance;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to update maintenance record",
      );
    }
  },
);

// Complete maintenance
export const completeMaintenance = createAsyncThunk(
  "maintenance/complete",
  async (
    { id, completedDate }: { id: string; completedDate: string },
    { rejectWithValue },
  ) => {
    try {
      const { data, error } = await supabase
        .from("maintenance")
        .update({
          status: "completed",
          completedDate,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Maintenance;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to complete maintenance record",
      );
    }
  },
);

// Delete maintenance record
export const deleteMaintenance = createAsyncThunk(
  "maintenance/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from("maintenance")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to delete maintenance record",
      );
    }
  },
);

const maintenanceSlice = createSlice({
  name: "maintenance",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch maintenance
    builder.addCase(fetchMaintenance.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMaintenance.fulfilled, (state, action) => {
      state.loading = false;
      state.maintenanceRecords = action.payload;
    });
    builder.addCase(fetchMaintenance.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Add maintenance
    builder.addCase(addMaintenance.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addMaintenance.fulfilled, (state, action) => {
      state.loading = false;
      state.maintenanceRecords.unshift(action.payload);
    });
    builder.addCase(addMaintenance.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update maintenance
    builder.addCase(updateMaintenance.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateMaintenance.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.maintenanceRecords.findIndex(
        (m) => m.id === action.payload.id,
      );
      if (index !== -1) {
        state.maintenanceRecords[index] = action.payload;
      }
    });
    builder.addCase(updateMaintenance.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Complete maintenance
    builder.addCase(completeMaintenance.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(completeMaintenance.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.maintenanceRecords.findIndex(
        (m) => m.id === action.payload.id,
      );
      if (index !== -1) {
        state.maintenanceRecords[index] = action.payload;
      }
    });
    builder.addCase(completeMaintenance.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete maintenance
    builder.addCase(deleteMaintenance.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteMaintenance.fulfilled, (state, action) => {
      state.loading = false;
      state.maintenanceRecords = state.maintenanceRecords.filter(
        (m) => m.id !== action.payload,
      );
    });
    builder.addCase(deleteMaintenance.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError } = maintenanceSlice.actions;
export default maintenanceSlice.reducer;
