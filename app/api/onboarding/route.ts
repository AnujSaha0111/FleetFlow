import { db } from "@/lib/db"; // We will create this helper next
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { role, phone } = body;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (existingUser) {
      return new NextResponse("User already exists", { status: 400 });
    }

    // Create user in Postgres
    await db.user.create({
      data: {
        clerkUserId: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName} ${user.lastName}`,
        role: role, // 'WAREHOUSE' or 'DEALER'
        phone: phone,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("[ONBOARDING_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}