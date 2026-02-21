import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../services/supabase";
import type { Expense } from "../../types";

interface ExpensesState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
}

const initialState: ExpensesState = {
  expenses: [],
  loading: false,
  error: null,
};

// Fetch all expenses
export const fetchExpenses = createAsyncThunk(
  "expenses/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      return data as Expense[];
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch expenses");
    }
  },
);

// Add new expense
export const addExpense = createAsyncThunk(
  "expenses/add",
  async (
    expenseData: Omit<Expense, "id" | "createdAt">,
    { rejectWithValue },
  ) => {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .insert([expenseData])
        .select()
        .single();

      if (error) throw error;
      return data as Expense;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to add expense");
    }
  },
);

// Update expense
export const updateExpense = createAsyncThunk(
  "expenses/update",
  async (
    { id, updates }: { id: string; updates: Partial<Expense> },
    { rejectWithValue },
  ) => {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Expense;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update expense");
    }
  },
);

// Delete expense
export const deleteExpense = createAsyncThunk(
  "expenses/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const { error } = await supabase.from("expenses").delete().eq("id", id);

      if (error) throw error;
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete expense");
    }
  },
);

const expensesSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch expenses
    builder.addCase(fetchExpenses.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchExpenses.fulfilled, (state, action) => {
      state.loading = false;
      state.expenses = action.payload;
    });
    builder.addCase(fetchExpenses.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Add expense
    builder.addCase(addExpense.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addExpense.fulfilled, (state, action) => {
      state.loading = false;
      state.expenses.unshift(action.payload);
    });
    builder.addCase(addExpense.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update expense
    builder.addCase(updateExpense.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateExpense.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.expenses.findIndex(
        (exp) => exp.id === action.payload.id,
      );
      if (index !== -1) {
        state.expenses[index] = action.payload;
      }
    });
    builder.addCase(updateExpense.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete expense
    builder.addCase(deleteExpense.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteExpense.fulfilled, (state, action) => {
      state.loading = false;
      state.expenses = state.expenses.filter(
        (exp) => exp.id !== action.payload,
      );
    });
    builder.addCase(deleteExpense.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError } = expensesSlice.actions;
export default expensesSlice.reducer;
