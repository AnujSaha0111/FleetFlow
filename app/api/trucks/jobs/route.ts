import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId"); // This is the Dealer's ID

  if (!userId) return new NextResponse("Missing User ID", { status: 400 });

  try {
    // FIND shipments where the assigned truck belongs to THIS dealer
    const jobs = await db.shipment.findMany({
      where: {
        status: "ASSIGNED", // Only show booked jobs
        assignedTruck: {
          dealerId: userId // The Relation Filter
        }
      },
      include: {
        assignedTruck: true // Include truck details to show License Plate
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.log("[JOBS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}