import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, firestore } from "../../services/firebase";
import { User, UserRole } from "../../types";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

// Async thunk for user login
export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const firebaseUser = userCredential.user;

      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(firestore, "users", firebaseUser.uid));

      if (!userDoc.exists()) {
        throw new Error("User profile not found");
      }

      const userData = userDoc.data();

      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        role: userData.role as UserRole,
        displayName: firebaseUser.displayName || undefined,
      };

      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || "Login failed");
    }
  },
);

// Async thunk for user registration
export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    {
      email,
      password,
      role,
    }: { email: string; password: string; role: UserRole },
    { rejectWithValue },
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const firebaseUser = userCredential.user;

      // Create user profile in Firestore
      await setDoc(doc(firestore, "users", firebaseUser.uid), {
        email: firebaseUser.email,
        role: role,
        createdAt: new Date().toISOString(),
      });

      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        role: role,
      };

      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || "Registration failed");
    }
  },
);

// Async thunk for user logout
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      return rejectWithValue(error.message || "Logout failed");
    }
  },
);

// Async thunk to check current user session
export const checkAuthState = createAsyncThunk(
  "auth/checkState",
  async (firebaseUser: FirebaseUser | null, { rejectWithValue }) => {
    try {
      if (!firebaseUser) {
        return null;
      }

      const userDoc = await getDoc(doc(firestore, "users", firebaseUser.uid));

      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();

      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        role: userData.role as UserRole,
        displayName: firebaseUser.displayName || undefined,
      };

      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || "Auth check failed");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.isAuthenticated = false;
    });

    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    });

    // Check auth state
    builder.addCase(checkAuthState.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.loading = false;
    });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
