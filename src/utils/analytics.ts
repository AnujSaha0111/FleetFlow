import type {
  Vehicle,
  Driver,
  Trip,
  Maintenance,
  FuelLog,
  Expense,
} from "../types";

/**
 * Calculate total revenue from all trips
 */
export const calculateTotalRevenue = (trips: Trip[]): number => {
  return trips
    .filter((trip) => trip.status === "completed" && trip.revenue)
    .reduce((total, trip) => {
      return total + (trip.revenue || 0);
    }, 0);
};

/**
 * Calculate total expenses from fuel logs, expense records, and maintenance
 */
export const calculateTotalExpenses = (
  fuelLogs: FuelLog[],
  expenses: Expense[],
  maintenanceRecords: Maintenance[],
): number => {
  const fuelCosts = fuelLogs.reduce((total, log) => total + log.totalCost, 0);
  const otherExpenses = expenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  );
  const maintenanceCosts = maintenanceRecords
    .filter((m) => m.status === "completed")
    .reduce((total, m) => total + m.cost, 0);
  return fuelCosts + otherExpenses + maintenanceCosts;
};

/**
 * Calculate profit (revenue - expenses)
 */
export const calculateProfit = (revenue: number, expenses: number): number => {
  return revenue - expenses;
};

/**
 * Calculate vehicle utilization (percentage of time vehicles are on trips)
 */
export const calculateVehicleUtilization = (
  vehicles: Vehicle[],
  trips: Trip[],
): {
  vehicleId: string;
  vehicleName: string;
  tripCount: number;
  utilization: number;
}[] => {
  return vehicles.map((vehicle) => {
    const vehicleTrips = trips.filter((trip) => trip.vehicleId === vehicle.id);
    const completedTrips = vehicleTrips.filter(
      (trip) => trip.status === "completed",
    ).length;
    const totalTrips = vehicleTrips.length;

    // Simple utilization: percentage of trips completed
    const utilization =
      totalTrips > 0 ? (completedTrips / totalTrips) * 100 : 0;

    return {
      vehicleId: vehicle.id,
      vehicleName: `${vehicle.name} (${vehicle.licensePlate})`,
      tripCount: totalTrips,
      utilization: Math.round(utilization),
    };
  });
};

/**
 * Calculate average fuel efficiency (km per liter) for each vehicle
 */
export const calculateFuelEfficiency = (
  vehicles: Vehicle[],
  fuelLogs: FuelLog[],
): {
  vehicleId: string;
  vehicleName: string;
  efficiency: number;
  totalFuelCost: number;
}[] => {
  return vehicles.map((vehicle) => {
    const vehicleFuelLogs = fuelLogs
      .filter((log) => log.vehicleId === vehicle.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (vehicleFuelLogs.length < 2) {
      return {
        vehicleId: vehicle.id,
        vehicleName: `${vehicle.name} (${vehicle.licensePlate})`,
        efficiency: 0,
        totalFuelCost: vehicleFuelLogs.reduce(
          (sum, log) => sum + log.totalCost,
          0,
        ),
      };
    }

    // Calculate efficiency based on odometer difference and fuel consumed
    let totalDistance = 0;
    let totalFuel = 0;
    let totalFuelCost = 0;

    for (let i = 1; i < vehicleFuelLogs.length; i++) {
      const prevLog = vehicleFuelLogs[i - 1];
      const currentLog = vehicleFuelLogs[i];
      const distance = currentLog.odometer - prevLog.odometer;

      if (distance > 0) {
        totalDistance += distance;
        totalFuel += currentLog.liters;
      }
      totalFuelCost += currentLog.totalCost;
    }

    const efficiency = totalFuel > 0 ? totalDistance / totalFuel : 0;

    return {
      vehicleId: vehicle.id,
      vehicleName: `${vehicle.name} (${vehicle.licensePlate})`,
      efficiency: Math.round(efficiency * 10) / 10, // Round to 1 decimal
      totalFuelCost,
    };
  });
};

/**
 * Calculate expense breakdown by category
 */
export const calculateExpenseBreakdown = (
  expenses: Expense[],
): { category: string; amount: number; percentage: number }[] => {
  const categoryTotals: Record<string, number> = {};

  expenses.forEach((expense) => {
    categoryTotals[expense.category] =
      (categoryTotals[expense.category] || 0) + expense.amount;
  });

  const total = Object.values(categoryTotals).reduce(
    (sum, amount) => sum + amount,
    0,
  );

  return Object.entries(categoryTotals).map(([category, amount]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    amount,
    percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
  }));
};

/**
 * Calculate maintenance frequency per vehicle
 */
export const calculateMaintenanceStats = (
  vehicles: Vehicle[],
  maintenanceRecords: Maintenance[],
): {
  vehicleId: string;
  vehicleName: string;
  maintenanceCount: number;
  totalMaintenanceCost: number;
}[] => {
  return vehicles.map((vehicle) => {
    const vehicleMaintenance = maintenanceRecords.filter(
      (record) => record.vehicleId === vehicle.id,
    );

    const totalCost = vehicleMaintenance.reduce(
      (sum, record) => sum + record.cost,
      0,
    );

    return {
      vehicleId: vehicle.id,
      vehicleName: `${vehicle.name} (${vehicle.licensePlate})`,
      maintenanceCount: vehicleMaintenance.length,
      totalMaintenanceCost: totalCost,
    };
  });
};

/**
 * Calculate driver performance metrics
 */
export const calculateDriverPerformance = (
  drivers: Driver[],
  trips: Trip[],
): {
  driverId: string;
  driverName: string;
  tripCount: number;
  safetyScore: number;
}[] => {
  return drivers.map((driver) => {
    const driverTrips = trips.filter((trip) => trip.driverId === driver.id);
    const completedTrips = driverTrips.filter(
      (trip) => trip.status === "completed",
    );

    return {
      driverId: driver.id,
      driverName: driver.name,
      tripCount: completedTrips.length,
      safetyScore: driver.safetyScore || 0,
    };
  });
};

/**
 * Calculate monthly trends for revenue and expenses
 */
export const calculateMonthlyTrends = (
  trips: Trip[],
  fuelLogs: FuelLog[],
  expenses: Expense[],
): { month: string; revenue: number; expenses: number; profit: number }[] => {
  const monthlyData: Record<string, { revenue: number; expenses: number }> = {};

  // Group trips by month
  trips.forEach((trip) => {
    if (trip.status === "completed" && trip.actualArrival) {
      const month = new Date(trip.actualArrival).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });

      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, expenses: 0 };
      }

      monthlyData[month].revenue += trip.revenue || 0;
    }
  });

  // Group fuel costs by month
  fuelLogs.forEach((log) => {
    const month = new Date(log.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });

    if (!monthlyData[month]) {
      monthlyData[month] = { revenue: 0, expenses: 0 };
    }

    monthlyData[month].expenses += log.totalCost;
  });

  // Group expenses by month
  expenses.forEach((expense) => {
    const month = new Date(expense.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });

    if (!monthlyData[month]) {
      monthlyData[month] = { revenue: 0, expenses: 0 };
    }

    monthlyData[month].expenses += expense.amount;
  });

  // Convert to array and calculate profit
  return Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      revenue: data.revenue,
      expenses: data.expenses,
      profit: data.revenue - data.expenses,
    }))
    .sort((a, b) => {
      // Sort by date
      return new Date(a.month).getTime() - new Date(b.month).getTime();
    });
};

/**
 * Get top performing vehicles by revenue
 */
export const getTopVehiclesByRevenue = (
  vehicles: Vehicle[],
  trips: Trip[],
  limit: number = 5,
): {
  vehicleId: string;
  vehicleName: string;
  revenue: number;
  tripCount: number;
}[] => {
  const vehicleRevenue = vehicles.map((vehicle) => {
    const vehicleTrips = trips.filter(
      (trip) => trip.vehicleId === vehicle.id && trip.status === "completed",
    );

    const totalRevenue = vehicleTrips.reduce(
      (sum, trip) => sum + (trip.revenue || 0),
      0,
    );

    return {
      vehicleId: vehicle.id,
      vehicleName: `${vehicle.name} (${vehicle.licensePlate})`,
      revenue: totalRevenue,
      tripCount: vehicleTrips.length,
    };
  });

  return vehicleRevenue.sort((a, b) => b.revenue - a.revenue).slice(0, limit);
};

/**
 * Calculate cost per kilometer for each vehicle
 */
export const calculateCostPerKm = (
  vehicles: Vehicle[],
  fuelLogs: FuelLog[],
  expenses: Expense[],
  maintenanceRecords: Maintenance[],
): {
  vehicleId: string;
  vehicleName: string;
  totalCost: number;
  totalKm: number;
  costPerKm: number;
}[] => {
  return vehicles.map((vehicle) => {
    const vehicleFuelLogs = fuelLogs.filter(
      (log) => log.vehicleId === vehicle.id,
    );
    const vehicleExpenses = expenses.filter(
      (exp) => exp.vehicleId === vehicle.id,
    );
    const vehicleMaintenance = maintenanceRecords.filter(
      (rec) => rec.vehicleId === vehicle.id,
    );

    const fuelCost = vehicleFuelLogs.reduce(
      (sum, log) => sum + log.totalCost,
      0,
    );
    const expenseCost = vehicleExpenses.reduce(
      (sum, exp) => sum + exp.amount,
      0,
    );
    const maintenanceCost = vehicleMaintenance.reduce(
      (sum, rec) => sum + rec.cost,
      0,
    );
    const totalCost = fuelCost + expenseCost + maintenanceCost;

    const totalKm = vehicle.currentOdometer;
    const costPerKm = totalKm > 0 ? totalCost / totalKm : 0;

    return {
      vehicleId: vehicle.id,
      vehicleName: `${vehicle.name} (${vehicle.licensePlate})`,
      totalCost,
      totalKm,
      costPerKm: Math.round(costPerKm * 100) / 100, // Round to 2 decimals
    };
  });
};
