import { useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  LocalShipping as TruckIcon,
  LocalGasStation as FuelIcon,
  Build as MaintenanceIcon,
  Assessment as AnalyticsIcon,
  CurrencyRupee as MoneyIcon,
  Speed as SpeedIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchVehicles } from "../store/slices/vehiclesSlice";
import { fetchDrivers } from "../store/slices/driversSlice";
import { fetchTrips } from "../store/slices/tripsSlice";
import { fetchMaintenance } from "../store/slices/maintenanceSlice";
import { fetchFuelLogs } from "../store/slices/fuelLogsSlice";
import { fetchExpenses } from "../store/slices/expensesSlice";
import {
  calculateTotalRevenue,
  calculateTotalExpenses,
  calculateProfit,
  calculateVehicleUtilization,
  calculateFuelEfficiency,
  calculateExpenseBreakdown,
  calculateMaintenanceStats,
  getTopVehiclesByRevenue,
  calculateCostPerKm,
} from "../utils/analytics";

export default function Analytics() {
  const dispatch = useAppDispatch();

  const vehicles = useAppSelector((state) => state.vehicles.vehicles);
  const trips = useAppSelector((state) => state.trips.trips);
  const maintenanceRecords = useAppSelector(
    (state) => state.maintenance.maintenanceRecords,
  );
  const fuelLogs = useAppSelector((state) => state.fuelLogs.fuelLogs);
  const expenses = useAppSelector((state) => state.expenses.expenses);

  useEffect(() => {
    dispatch(fetchVehicles());
    dispatch(fetchDrivers());
    dispatch(fetchTrips());
    dispatch(fetchMaintenance());
    dispatch(fetchFuelLogs());
    dispatch(fetchExpenses());
  }, [dispatch]);

  // Calculate metrics
  const totalRevenue = calculateTotalRevenue(trips);
  const totalExpenses = calculateTotalExpenses(
    fuelLogs,
    expenses,
    maintenanceRecords,
  );
  const profit = calculateProfit(totalRevenue, totalExpenses);
  const profitMargin =
    totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : "0";

  const vehicleUtilization = calculateVehicleUtilization(vehicles, trips);
  const fuelEfficiency = calculateFuelEfficiency(vehicles, fuelLogs);
  const expenseBreakdown = calculateExpenseBreakdown(expenses);
  const maintenanceStats = calculateMaintenanceStats(
    vehicles,
    maintenanceRecords,
  );
  const topVehicles = getTopVehiclesByRevenue(vehicles, trips, 5);
  const costPerKm = calculateCostPerKm(
    vehicles,
    fuelLogs,
    expenses,
    maintenanceRecords,
  );

  const avgFuelEfficiency =
    fuelEfficiency.length > 0
      ? fuelEfficiency.reduce((sum, v) => sum + v.efficiency, 0) /
        fuelEfficiency.length
      : 0;

  const totalMaintenanceCost = maintenanceRecords.reduce(
    (sum: number, record) => sum + record.cost,
    0,
  );
  const completedTrips = trips.filter(
    (trip) => trip.status === "completed",
  ).length;

  // Helper component for KPI cards
  const KPICard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
    trend,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
    color: string;
    trend?: "up" | "down";
  }) => (
    <Card
      sx={{
        height: "100%",
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}40`,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Icon sx={{ fontSize: 40, color }} />
          {trend && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {trend === "up" ? (
                <TrendingUpIcon sx={{ color: "success.main" }} />
              ) : (
                <TrendingDownIcon sx={{ color: "error.main" }} />
              )}
            </Box>
          )}
        </Box>
        <Typography variant="h4" fontWeight={700} color={color} gutterBottom>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 0.5, display: "block" }}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  // Helper component for progress bars
  const ProgressBar = ({
    label,
    value,
    max,
    color,
  }: {
    label: string;
    value: number;
    max: number;
    color?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
  }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="body2" fontWeight={600}>
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {value.toFixed(1)} / {max.toFixed(1)}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.min(percentage, 100)}
          color={color || "primary"}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: "grey.200",
          }}
        />
      </Box>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <AnalyticsIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Operational Analytics
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Comprehensive insights into fleet performance and financial metrics
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* @ts-expect-error MUI v7 Grid type definition issue */}
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            subtitle={`${completedTrips} completed trips`}
            icon={MoneyIcon}
            color="#10b981"
            trend="up"
          />
        </Grid>
        {/* @ts-expect-error MUI v7 Grid type definition issue */}
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Total Expenses"
            value={`₹${totalExpenses.toLocaleString()}`}
            subtitle={`${fuelLogs.length + expenses.length} transactions`}
            icon={TrendingDownIcon}
            color="#ef4444"
          />
        </Grid>
        {/* @ts-expect-error MUI v7 Grid type definition issue */}
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Net Profit"
            value={`₹${profit.toLocaleString()}`}
            subtitle={`${profitMargin}% profit margin`}
            icon={TrendingUpIcon}
            color={profit >= 0 ? "#10b981" : "#ef4444"}
            trend={profit >= 0 ? "up" : "down"}
          />
        </Grid>
        {/* @ts-expect-error MUI v7 Grid type definition issue */}
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Avg Fuel Efficiency"
            value={`${avgFuelEfficiency.toFixed(1)} km/L`}
            subtitle={`${fuelLogs.length} fuel logs tracked`}
            icon={FuelIcon}
            color="#3b82f6"
          />
        </Grid>
      </Grid>

      {/* Two Column Layout */}
      <Grid container spacing={3}>
        {/* Left Column */}
        {/* @ts-expect-error MUI v7 Grid type definition issue */}
        <Grid item xs={12} md={6}>
          {/* Vehicle Utilization */}
          <Paper sx={{ p: 3, mb: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <TruckIcon sx={{ color: "primary.main" }} />
              <Typography variant="h6" fontWeight={600}>
                Vehicle Utilization
              </Typography>
            </Box>
            {vehicleUtilization.length === 0 ? (
              <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                No vehicle data available
              </Typography>
            ) : (
              vehicleUtilization.map((vehicle) => (
                <ProgressBar
                  key={vehicle.vehicleId}
                  label={vehicle.vehicleName}
                  value={vehicle.utilization}
                  max={100}
                  color={
                    vehicle.utilization >= 80
                      ? "success"
                      : vehicle.utilization >= 50
                        ? "primary"
                        : "warning"
                  }
                />
              ))
            )}
          </Paper>

          {/* Fuel Efficiency */}
          <Paper sx={{ p: 3, mb: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <SpeedIcon sx={{ color: "info.main" }} />
              <Typography variant="h6" fontWeight={600}>
                Fuel Efficiency by Vehicle
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.50" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Vehicle</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      km/L
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Fuel Cost
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fuelEfficiency.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No fuel data available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    fuelEfficiency.map((vehicle) => (
                      <TableRow key={vehicle.vehicleId} hover>
                        <TableCell>
                          <Typography variant="body2" noWrap>
                            {vehicle.vehicleName}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={
                              vehicle.efficiency > 0
                                ? `${vehicle.efficiency} km/L`
                                : "N/A"
                            }
                            size="small"
                            color={
                              vehicle.efficiency >= 10
                                ? "success"
                                : vehicle.efficiency >= 7
                                  ? "primary"
                                  : "warning"
                            }
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            ₹{vehicle.totalFuelCost.toLocaleString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Expense Breakdown */}
          <Paper sx={{ p: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <MoneyIcon sx={{ color: "secondary.main" }} />
              <Typography variant="h6" fontWeight={600}>
                Expense Breakdown
              </Typography>
            </Box>
            {expenseBreakdown.length === 0 ? (
              <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                No expense data available
              </Typography>
            ) : (
              expenseBreakdown.map((expense) => (
                <Box key={expense.category} sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {expense.category}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ₹{expense.amount.toLocaleString()} ({expense.percentage}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={expense.percentage}
                    color="secondary"
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: "grey.200",
                    }}
                  />
                </Box>
              ))
            )}
          </Paper>
        </Grid>

        {/* Right Column */}
        {/* @ts-expect-error MUI v7 Grid type definition issue */}
        <Grid item xs={12} md={6}>
          {/* Top Vehicles by Revenue */}
          <Paper sx={{ p: 3, mb: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <TrendingUpIcon sx={{ color: "success.main" }} />
              <Typography variant="h6" fontWeight={600}>
                Top Vehicles by Revenue
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.50" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Rank</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Vehicle</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Trips
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Revenue
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topVehicles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No trip data available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    topVehicles.map((vehicle, index) => (
                      <TableRow key={vehicle.vehicleId} hover>
                        <TableCell>
                          <Chip
                            label={`#${index + 1}`}
                            size="small"
                            color={index === 0 ? "success" : "default"}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap>
                            {vehicle.vehicleName}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {vehicle.tripCount}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="success.main"
                          >
                            ₹{vehicle.revenue.toLocaleString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Maintenance Statistics */}
          <Paper sx={{ p: 3, mb: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <MaintenanceIcon sx={{ color: "warning.main" }} />
              <Typography variant="h6" fontWeight={600}>
                Maintenance Overview
              </Typography>
            </Box>
            <Box
              sx={{ mb: 3, p: 2, bgcolor: "warning.lighter", borderRadius: 2 }}
            >
              <Typography variant="h5" fontWeight={700} color="warning.dark">
                ₹{totalMaintenanceCost.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Maintenance Cost
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.50" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Vehicle</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Records
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Cost
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {maintenanceStats.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No maintenance data available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    maintenanceStats
                      .filter((stat) => stat.maintenanceCount > 0)
                      .sort(
                        (a, b) =>
                          b.totalMaintenanceCost - a.totalMaintenanceCost,
                      )
                      .map((stat) => (
                        <TableRow key={stat.vehicleId} hover>
                          <TableCell>
                            <Typography variant="body2" noWrap>
                              {stat.vehicleName}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={stat.maintenanceCount}
                              size="small"
                              color="warning"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              ₹{stat.totalMaintenanceCost.toLocaleString()}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Cost Per Kilometer */}
          <Paper sx={{ p: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <SpeedIcon sx={{ color: "error.main" }} />
              <Typography variant="h6" fontWeight={600}>
                Cost Per Kilometer
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.50" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Vehicle</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Total km
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Cost/km
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {costPerKm.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No data available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    costPerKm
                      .filter((vehicle) => vehicle.totalKm > 0)
                      .sort((a, b) => a.costPerKm - b.costPerKm)
                      .map((vehicle) => (
                        <TableRow key={vehicle.vehicleId} hover>
                          <TableCell>
                            <Typography variant="body2" noWrap>
                              {vehicle.vehicleName}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {vehicle.totalKm.toLocaleString()} km
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={`₹${vehicle.costPerKm}`}
                              size="small"
                              color={
                                vehicle.costPerKm <= 5
                                  ? "success"
                                  : vehicle.costPerKm <= 10
                                    ? "primary"
                                    : "error"
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
