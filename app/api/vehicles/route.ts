import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET: Fetch all vehicles from the database
export async function GET() {
  try {
    const vehicles = await db.vehicle.findMany({
      orderBy: { createdAt: "desc" }, // Newest first
    });
    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("[VEHICLES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST: Add a new vehicle to the registry
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, licensePlate, maxLoadCapacity, odometer } = body;

    // Validation to ensure required fields are present
    if (!name || !licensePlate || !maxLoadCapacity) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Insert into PostgreSQL via Prisma
    const vehicle = await db.vehicle.create({
      data: {
        name,
        licensePlate,
        maxLoadCapacity: parseFloat(maxLoadCapacity),
        odometer: parseFloat(odometer || "0"), // Default to 0 if empty
        status: "AVAILABLE", // Default status as per our schema
      },
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error("[VEHICLES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}