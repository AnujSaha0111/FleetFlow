import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Provider } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { store } from "./store/store";
import { auth } from "./services/firebase";
import { checkAuthState } from "./store/slices/authSlice";
import Login from "./components/auth/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import VehicleRegistry from "./pages/VehicleRegistry";
import DriverProfiles from "./pages/DriverProfiles";
import TripDispatcher from "./pages/TripDispatcher";
import MaintenanceLogs from "./pages/MaintenanceLogs";
import FuelExpenses from "./pages/FuelExpenses";
import Analytics from "./pages/Analytics";

// Create Material-UI theme with enhanced colors
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#667eea",
      light: "#8b9aff",
      dark: "#4c63d2",
    },
    secondary: {
      main: "#764ba2",
      light: "#9d6ec5",
      dark: "#5a3780",
    },
    success: {
      main: "#10b981",
      light: "#34d399",
      dark: "#059669",
    },
    warning: {
      main: "#f59e0b",
      light: "#fbbf24",
      dark: "#d97706",
    },
    error: {
      main: "#ef4444",
      light: "#f87171",
      dark: "#dc2626",
    },
    info: {
      main: "#3b82f6",
      light: "#60a5fa",
      dark: "#2563eb",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.5px",
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    "none",
    "0px 2px 4px rgba(0,0,0,0.05)",
    "0px 4px 8px rgba(0,0,0,0.08)",
    "0px 8px 16px rgba(0,0,0,0.1)",
    "0px 12px 24px rgba(0,0,0,0.12)",
    "0px 16px 32px rgba(0,0,0,0.15)",
    "0px 20px 40px rgba(0,0,0,0.18)",
    "0px 24px 48px rgba(0,0,0,0.2)",
    "0px 2px 4px rgba(0,0,0,0.05)",
    "0px 4px 8px rgba(0,0,0,0.08)",
    "0px 8px 16px rgba(0,0,0,0.1)",
    "0px 12px 24px rgba(0,0,0,0.12)",
    "0px 16px 32px rgba(0,0,0,0.15)",
    "0px 20px 40px rgba(0,0,0,0.18)",
    "0px 24px 48px rgba(0,0,0,0.2)",
    "0px 28px 56px rgba(0,0,0,0.22)",
    "0px 32px 64px rgba(0,0,0,0.24)",
    "0px 36px 72px rgba(0,0,0,0.26)",
    "0px 40px 80px rgba(0,0,0,0.28)",
    "0px 44px 88px rgba(0,0,0,0.3)",
    "0px 48px 96px rgba(0,0,0,0.32)",
    "0px 52px 104px rgba(0,0,0,0.34)",
    "0px 56px 112px rgba(0,0,0,0.36)",
    "0px 60px 120px rgba(0,0,0,0.38)",
    "0px 64px 128px rgba(0,0,0,0.4)",
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
          padding: "10px 24px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

// Auth Listener Component
const AuthListener: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      store.dispatch(checkAuthState(firebaseUser));
    });

    return () => unsubscribe();
  }, []);

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AuthListener>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="vehicles" element={<VehicleRegistry />} />
                <Route path="drivers" element={<DriverProfiles />} />
                <Route path="trips" element={<TripDispatcher />} />
                <Route path="maintenance" element={<MaintenanceLogs />} />
                <Route path="expenses" element={<FuelExpenses />} />
                <Route
                  path="analytics"
                  element={
                    <ProtectedRoute allowedRoles={["manager"]}>
                      <Analytics />
                    </ProtectedRoute>
                  }
                />
              </Route>

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AuthListener>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
