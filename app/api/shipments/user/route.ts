import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) return new NextResponse("Missing User ID", { status: 400 });

  const shipments = await db.shipment.findMany({
    where: { warehouseId: userId },
    orderBy: { createdAt: 'desc' },
    include: { assignedTruck: true } // see which truck took it
  });

  return NextResponse.json(shipments);
}