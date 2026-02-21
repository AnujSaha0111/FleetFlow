import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const vehicles = await db.vehicle.findMany({
      include: {
        fuelLogs: true,
        maintenanceLogs: true,
      },
      orderBy: { name: "asc" }
    });

    // Process and aggregate the data for the frontend
    const analyticsData = vehicles.map((v) => {
      // 1. Sum up Fuel
      const totalFuelLiters = v.fuelLogs.reduce((sum, log) => sum + log.liters, 0);
      const totalFuelCost = v.fuelLogs.reduce((sum, log) => sum + log.cost, 0);

      // 2. Sum up Maintenance
      const totalMaintenanceCost = v.maintenanceLogs.reduce((sum, log) => sum + log.cost, 0);

      // 3. Calculate Operational Cost
      const totalOperationalCost = totalFuelCost + totalMaintenanceCost;

      // 4. Calculate Efficiency Metrics (Prevent division by zero)
      const fuelEfficiency = totalFuelLiters > 0 ? (v.odometer / totalFuelLiters) : 0;
      const costPerKm = v.odometer > 0 ? (totalOperationalCost / v.odometer) : 0;

      return {
        id: v.id,
        name: v.name,
        licensePlate: v.licensePlate,
        odometer: v.odometer,
        totalFuelLiters,
        totalFuelCost,
        totalMaintenanceCost,
        totalOperationalCost,
        fuelEfficiency: fuelEfficiency.toFixed(2), // km/L
        costPerKm: costPerKm.toFixed(2),           // ₹/km
      };
    });

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("[ANALYTICS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}