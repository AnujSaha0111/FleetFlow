import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) return new NextResponse("Missing User ID", { status: 400 });

  // Find all trucks owned by this dealer that have an assigned shipment
  const jobs = await db.shipment.findMany({
    where: {
      assignedTruck: {
        dealerId: userId
      },
      status: "ASSIGNED"
    },
    include: {
      assignedTruck: true
    }
  });

  return NextResponse.json(jobs);
}