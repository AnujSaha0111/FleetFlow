import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../services/supabase";
import type { Trip } from "../../types";

interface TripsState {
  trips: Trip[];
  loading: boolean;
  error: string | null;
}

const initialState: TripsState = {
  trips: [],
  loading: false,
  error: null,
};

// Fetch all trips
export const fetchTrips = createAsyncThunk(
  "trips/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .order("createdAt", { ascending: false });

      if (error) throw error;
      return data as Trip[];
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch trips");
    }
  },
);

// Add new trip
export const addTrip = createAsyncThunk(
  "trips/add",
  async (
    tripData: Omit<Trip, "id" | "createdAt" | "updatedAt">,
    { rejectWithValue },
  ) => {
    try {
      const { data, error } = await supabase
        .from("trips")
        .insert([tripData])
        .select()
        .single();

      if (error) throw error;
      return data as Trip;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to add trip");
    }
  },
);

// Update trip
export const updateTrip = createAsyncThunk(
  "trips/update",
  async (
    { id, updates }: { id: string; updates: Partial<Trip> },
    { rejectWithValue },
  ) => {
    try {
      const { data, error } = await supabase
        .from("trips")
        .update({ ...updates, updatedAt: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Trip;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update trip");
    }
  },
);

// Complete trip
export const completeTrip = createAsyncThunk(
  "trips/complete",
  async (
    {
      id,
      endOdometer,
      actualArrival,
    }: { id: string; endOdometer: number; actualArrival: string },
    { rejectWithValue },
  ) => {
    try {
      const { data, error } = await supabase
        .from("trips")
        .update({
          status: "completed",
          endOdometer,
          actualArrival,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Trip;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to complete trip");
    }
  },
);

// Delete trip
export const deleteTrip = createAsyncThunk(
  "trips/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase.from("trips").delete().eq("id", id);

      if (error) throw error;
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete trip");
    }
  },
);

const tripsSlice = createSlice({
  name: "trips",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch trips
    builder.addCase(fetchTrips.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTrips.fulfilled, (state, action) => {
      state.loading = false;
      state.trips = action.payload;
    });
    builder.addCase(fetchTrips.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Add trip
    builder.addCase(addTrip.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addTrip.fulfilled, (state, action) => {
      state.loading = false;
      state.trips.unshift(action.payload);
    });
    builder.addCase(addTrip.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update trip
    builder.addCase(updateTrip.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateTrip.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.trips.findIndex(
        (trip) => trip.id === action.payload.id,
      );
      if (index !== -1) {
        state.trips[index] = action.payload;
      }
    });
    builder.addCase(updateTrip.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Complete trip
    builder.addCase(completeTrip.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(completeTrip.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.trips.findIndex(
        (trip) => trip.id === action.payload.id,
      );
      if (index !== -1) {
        state.trips[index] = action.payload;
      }
    });
    builder.addCase(completeTrip.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete trip
    builder.addCase(deleteTrip.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteTrip.fulfilled, (state, action) => {
      state.loading = false;
      state.trips = state.trips.filter((trip) => trip.id !== action.payload);
    });
    builder.addCase(deleteTrip.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError } = tripsSlice.actions;
export default tripsSlice.reducer;
