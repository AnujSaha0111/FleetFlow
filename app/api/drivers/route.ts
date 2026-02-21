import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const drivers = await db.driver.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(drivers);
  } catch (error) {
    console.error("[DRIVERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, licenseExpiry } = body;

    if (!name || !licenseExpiry) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const driver = await db.driver.create({
      data: {
        name,
        // Convert the HTML date string to a proper ISO DateTime for Prisma
        licenseExpiry: new Date(licenseExpiry).toISOString(), 
        safetyScore: 100.0, // Everyone starts with a perfect score
        status: "ON_DUTY",
      },
    });

    return NextResponse.json(driver);
  } catch (error) {
    console.error("[DRIVERS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}