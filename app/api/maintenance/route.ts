import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET: Fetch all maintenance logs
export async function GET() {
  try {
    const logs = await db.maintenanceLog.findMany({
      include: { vehicle: true },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(logs);
  } catch (error) {
    console.error("[MAINTENANCE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST: Create a log AND move vehicle to IN_SHOP
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vehicleId, description, cost } = body;

    if (!vehicleId || !description) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const serviceCost = parseFloat(cost || "0");

    // Database Transaction: Log the expense and update the status
    const result = await db.$transaction([
      db.maintenanceLog.create({
        data: {
          description,
          cost: serviceCost,
          vehicleId,
        },
      }),
      db.vehicle.update({
        where: { id: vehicleId },
        data: { status: "IN_SHOP" }, // Locks the vehicle
      }),
    ]);

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("[MAINTENANCE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PATCH: Release a vehicle back to AVAILABLE
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { vehicleId } = body;

    if (!vehicleId) return new NextResponse("Missing Vehicle ID", { status: 400 });

    const vehicle = await db.vehicle.update({
      where: { id: vehicleId },
      data: { status: "AVAILABLE" },
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error("[MAINTENANCE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}