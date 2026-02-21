import React, { useEffect, useMemo } from "react";
import { Box, Typography, Grid, Paper, Alert } from "@mui/material";
import {
  DirectionsCar,
  Build,
  TrendingUp,
  LocalShipping,
  Person,
  Warning,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchVehicles } from "../store/slices/vehiclesSlice";
import { fetchDrivers } from "../store/slices/driversSlice";
import { fetchTrips } from "../store/slices/tripsSlice";
import { fetchMaintenance } from "../store/slices/maintenanceSlice";
import { fetchFuelLogs } from "../store/slices/fuelLogsSlice";
import { fetchExpenses } from "../store/slices/expensesSlice";
import KPICard from "../components/dashboard/KPICard";
import {
  calculateDashboardKPIs,
  getAvailableDriversCount,
  getAvailableVehiclesCount,
} from "../utils/calculations";

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();

  const { vehicles, loading: vehiclesLoading } = useAppSelector(
    (state) => state.vehicles,
  );
  const { drivers, loading: driversLoading } = useAppSelector(
    (state) => state.drivers,
  );
  const { trips, loading: tripsLoading } = useAppSelector(
    (state) => state.trips,
  );
  const { maintenanceRecords, loading: maintenanceLoading } = useAppSelector(
    (state) => state.maintenance,
  );
  const { fuelLogs } = useAppSelector((state) => state.fuelLogs);
  const { expenses } = useAppSelector((state) => state.expenses);
  const { user } = useAppSelector((state) => state.auth);

  // Fetch all data on component mount
  useEffect(() => {
    dispatch(fetchVehicles());
    dispatch(fetchDrivers());
    dispatch(fetchTrips());
    dispatch(fetchMaintenance());
    dispatch(fetchFuelLogs());
    dispatch(fetchExpenses());
  }, [dispatch]);

  // Calculate KPIs
  const kpis = useMemo(
    () =>
      calculateDashboardKPIs(
        vehicles,
        drivers,
        trips,
        maintenanceRecords,
        fuelLogs,
        expenses,
      ),
    [vehicles, drivers, trips, maintenanceRecords, fuelLogs, expenses],
  );

  const availableVehicles = useMemo(
    () => getAvailableVehiclesCount(vehicles),
    [vehicles],
  );

  const availableDrivers = useMemo(
    () => getAvailableDriversCount(drivers),
    [drivers],
  );

  const loading =
    vehiclesLoading || driversLoading || tripsLoading || maintenanceLoading;

  return (
    <Box>
      {/* Header Section */}
      <Box
        sx={{
          mb: 4,
          pb: 3,
          borderBottom: "2px solid",
          borderImage: "linear-gradient(90deg, #667eea, #764ba2) 1",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 700,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Command Center
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontSize: "1rem" }}
        >
          Welcome back, <strong>{user?.email}</strong>! Here's your fleet
          overview.
        </Typography>
      </Box>

      {/* Main KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* @ts-expect-error MUI v7 Grid type definition issue */}
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Active Fleet"
            value={kpis.activeFleetCount}
            icon={DirectionsCar}
            color="#667eea"
            loading={loading}
            subtitle={`${availableVehicles} available`}
          />
        </Grid>
        {/* @ts-expect-error MUI v7 Grid type definition issue */}
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Maintenance Alerts"
            value={kpis.maintenanceAlerts}
            icon={Build}
            color="#f59e0b"
            loading={loading}
            subtitle="Requires attention"
          />
        </Grid>
        {/* @ts-expect-error MUI v7 Grid type definition issue */}
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Utilization Rate"
            value={`${kpis.utilizationRate}%`}
            icon={TrendingUp}
            color="#10b981"
            loading={loading}
            subtitle="Fleet in use"
          />
        </Grid>
        {/* @ts-expect-error MUI v7 Grid type definition issue */}
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Active Trips"
            value={kpis.pendingCargo}
            icon={LocalShipping}
            color="#8b5cf6"
            loading={loading}
            subtitle="In progress"
          />
        </Grid>
      </Grid>

      {/* Additional Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* @ts-expect-error MUI v7 Grid type definition issue */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: "100%",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              transition: "all 0.3s",
              "&:hover": {
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                borderColor: "primary.main",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <Box
                sx={{
                  backgroundColor: "primary.main",
                  borderRadius: 2,
                  p: 1,
                  mr: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Person sx={{ color: "white", fontSize: 28 }} />
              </Box>
              <Typography variant="h6" fontWeight="bold">
                Driver Status
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {/* @ts-expect-error MUI v7 Grid type definition issue */}
              <Grid item xs={6}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "grey.50",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    Total Drivers
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{ mt: 1, color: "text.primary" }}
                  >
                    {drivers.length}
                  </Typography>
                </Box>
              </Grid>
              {/* @ts-expect-error MUI v7 Grid type definition issue */}
              <Grid item xs={6}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "success.50",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    Available Now
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{ mt: 1, color: "success.main" }}
                  >
                    {availableDrivers}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* @ts-expect-error MUI v7 Grid type definition issue */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: "100%",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              transition: "all 0.3s",
              "&:hover": {
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                borderColor: "primary.main",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <Box
                sx={{
                  backgroundColor: "primary.main",
                  borderRadius: 2,
                  p: 1,
                  mr: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <DirectionsCar sx={{ color: "white", fontSize: 28 }} />
              </Box>
              <Typography variant="h6" fontWeight="bold">
                Vehicle Overview
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {/* @ts-expect-error MUI v7 Grid type definition issue */}
              <Grid item xs={4}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "grey.50",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    Total
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{ mt: 1, color: "text.primary" }}
                  >
                    {vehicles.length}
                  </Typography>
                </Box>
              </Grid>
              {/* @ts-expect-error MUI v7 Grid type definition issue */}
              <Grid item xs={4}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "info.50",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    On Trip
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{ mt: 1, color: "info.main" }}
                  >
                    {vehicles.filter((v) => v.status === "on-trip").length}
                  </Typography>
                </Box>
              </Grid>
              {/* @ts-expect-error MUI v7 Grid type definition issue */}
              <Grid item xs={4}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "warning.50",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    In Shop
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{ mt: 1, color: "warning.main" }}
                  >
                    {vehicles.filter((v) => v.status === "in-shop").length}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Alerts Section */}
      {kpis.maintenanceAlerts > 0 && (
        <Alert
          severity="warning"
          icon={<Warning />}
          sx={{
            mb: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "warning.light",
            "& .MuiAlert-icon": {
              fontSize: 28,
            },
          }}
        >
          <strong>{kpis.maintenanceAlerts} vehicle(s)</strong> require
          maintenance attention. Check the Maintenance page for details.
        </Alert>
      )}

      {vehicles.length === 0 && !loading && (
        <Alert
          severity="info"
          sx={{
            mb: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "info.light",
          }}
        >
          No vehicles in the system yet. Add your first vehicle to get started!
        </Alert>
      )}

      {/* Financial Overview (Manager Only) */}
      {user?.role === "manager" && (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: "-50%",
              right: "-10%",
              width: "300px",
              height: "300px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "50%",
            },
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            gutterBottom
            sx={{ position: "relative", zIndex: 1 }}
          >
            💰 Financial Summary
          </Typography>
          <Grid
            container
            spacing={3}
            sx={{ mt: 2, position: "relative", zIndex: 1 }}
          >
            {/* @ts-expect-error MUI v7 Grid type definition issue */}
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.15)",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ opacity: 0.9, fontWeight: 600 }}
                >
                  Total Revenue
                </Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                  ${kpis.totalRevenue.toLocaleString()}
                </Typography>
              </Box>
            </Grid>
            {/* @ts-expect-error MUI v7 Grid type definition issue */}
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.15)",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ opacity: 0.9, fontWeight: 600 }}
                >
                  Total Expenses
                </Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                  ${kpis.totalExpenses.toLocaleString()}
                </Typography>
              </Box>
            </Grid>
            {/* @ts-expect-error MUI v7 Grid type definition issue */}
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.25)",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ opacity: 0.9, fontWeight: 600 }}
                >
                  Net Profit
                </Typography>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                  ${(kpis.totalRevenue - kpis.totalExpenses).toLocaleString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default Dashboard;
