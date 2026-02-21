import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET: Fetch all trips with their related Vehicle and Driver data
export async function GET() {
  try {
    const trips = await db.trip.findMany({
      include: {
        vehicle: true,
        driver: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(trips);
  } catch (error) {
    console.error("[TRIPS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST: Validate and Dispatch a new Trip
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vehicleId, driverId, cargoWeight } = body;
    const weight = parseFloat(cargoWeight);

    if (!vehicleId || !driverId || isNaN(weight)) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // 1. Fetch the exact vehicle and driver from the database
    const vehicle = await db.vehicle.findUnique({ where: { id: vehicleId } });
    const driver = await db.driver.findUnique({ where: { id: driverId } });

    if (!vehicle || !driver) {
      return new NextResponse("Vehicle or Driver not found", { status: 404 });
    }

    // 2. VALIDATION RULE 1: Capacity Check
    if (weight > vehicle.maxLoadCapacity) {
      return new NextResponse(
        `Cargo (${weight}kg) exceeds vehicle capacity (${vehicle.maxLoadCapacity}kg)`, 
        { status: 400 }
      );
    }

    // 3. VALIDATION RULE 2: Compliance Check
    if (new Date(driver.licenseExpiry) < new Date()) {
      return new NextResponse("Driver's license is expired. Assignment blocked.", { status: 403 });
    }

    // 4. TRANSACTION: Create the trip AND update the vehicle status simultaneously
    const result = await db.$transaction([
      db.trip.create({
        data: {
          cargoWeight: weight,
          vehicleId,
          driverId,
          status: "DISPATCHED", // Progress lifecycle directly to Dispatched
        },
        include: { vehicle: true, driver: true }
      }),
      db.vehicle.update({
        where: { id: vehicleId },
        data: { status: "ON_TRIP" }, // Auto-Status Update
      }),
    ]);

    return NextResponse.json(result[0]); // Return the created trip
  } catch (error) {
    console.error("[TRIPS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}