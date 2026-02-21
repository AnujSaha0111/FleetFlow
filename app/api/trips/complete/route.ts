import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tripId, vehicleId, finalOdometer, fuelLiters, fuelCost } = body;

    if (!tripId || !vehicleId || !finalOdometer) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const odo = parseFloat(finalOdometer);
    const liters = parseFloat(fuelLiters || "0");
    const cost = parseFloat(fuelCost || "0");

    // Execute the 3-step completion process as a single transaction
    const result = await db.$transaction([
      // 1. Mark Trip as COMPLETED
      db.trip.update({
        where: { id: tripId },
        data: { 
          status: "COMPLETED",
          completedAt: new Date()
        },
      }),

      // 2. Update Vehicle Status & Odometer
      db.vehicle.update({
        where: { id: vehicleId },
        data: { 
          status: "AVAILABLE", // Frees up the vehicle for the Dispatcher
          odometer: odo 
        },
      }),

      // 3. Save the Fuel Log (Only if they entered fuel data)
      ...(liters > 0 || cost > 0 
        ? [db.fuelLog.create({
            data: {
              liters,
              cost,
              vehicleId,
              tripId,
            }
          })] 
        : []
      )
    ]);

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("[TRIPS_COMPLETE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}