import type {
  Vehicle,
  Driver,
  Trip,
  Maintenance,
  FuelLog,
  Expense,
  DashboardKPIs,
} from "../types";

export const calculateDashboardKPIs = (
  vehicles: Vehicle[],
  _drivers: Driver[],
  trips: Trip[],
  maintenanceRecords: Maintenance[],
  fuelLogs: FuelLog[],
  expenses: Expense[],
): DashboardKPIs => {
  // Active fleet count - vehicles that are either available or on trip (not in shop)
  const activeFleetCount = vehicles.filter(
    (v) => v.status === "available" || v.status === "on-trip",
  ).length;

  // Maintenance alerts - pending or in-progress maintenance
  const maintenanceAlerts = maintenanceRecords.filter(
    (m) => m.status === "pending" || m.status === "in-progress",
  ).length;

  // Utilization rate - percentage of vehicles currently on trip
  const onTripCount = vehicles.filter((v) => v.status === "on-trip").length;
  const utilizationRate =
    vehicles.length > 0 ? Math.round((onTripCount / vehicles.length) * 100) : 0;

  // Pending cargo - active trips
  const pendingCargo = trips.filter((t) => t.status === "active").length;

  // Total revenue from completed trips
  const totalRevenue = trips
    .filter((t) => t.status === "completed" && t.revenue)
    .reduce((sum, t) => sum + (t.revenue || 0), 0);

  // Total expenses from fuel logs, expenses, and completed maintenance
  const fuelCosts = fuelLogs.reduce((sum, log) => sum + log.totalCost, 0);
  const otherExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
  const maintenanceCosts = maintenanceRecords
    .filter((m) => m.status === "completed")
    .reduce((sum, m) => sum + m.cost, 0);
  const totalExpenses = fuelCosts + otherExpenses + maintenanceCosts;

  return {
    activeFleetCount,
    maintenanceAlerts,
    utilizationRate,
    pendingCargo,
    totalRevenue,
    totalExpenses,
  };
};

export const isLicenseExpired = (expiryDate: string): boolean => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  return expiry < today;
};

export const getAvailableDriversCount = (drivers: Driver[]): number => {
  return drivers.filter(
    (d) => d.dutyStatus === "available" && !isLicenseExpired(d.licenseExpiry),
  ).length;
};

export const getAvailableVehiclesCount = (vehicles: Vehicle[]): number => {
  return vehicles.filter((v) => v.status === "available").length;
};
