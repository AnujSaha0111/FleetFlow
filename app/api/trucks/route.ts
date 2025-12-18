import { db } from "../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, licensePlate, type, capacityWeight, capacityVolume, costPerKm } = body;

    // Convert strings to numbers because forms send strings
    const truck = await db.truck.create({
      data: {
        dealerId: userId,
        licensePlate,
        truckType: type,
        capacityWeight: parseFloat(capacityWeight),
        capacityVolume: parseFloat(capacityVolume),
        costPerKm: parseFloat(costPerKm),
        fuelEfficiency: 4.0, // Default constant for now (4 km/l)
      },
    });

    return NextResponse.json(truck);
  } catch (error) {
    console.log("[TRUCK_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}