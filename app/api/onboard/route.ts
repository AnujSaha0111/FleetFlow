import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    // 1. Verify the user is actually logged in via Clerk
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Get the role they selected from the frontend
    const body = await req.json();
    const { role } = body;

    if (!role) {
      return new NextResponse("Role is required", { status: 400 });
    }

    // 3. Check if they somehow already exist in our DB
    const existingUser = await db.user.findUnique({
      where: { clerkUserId: clerkUser.id },
    });

    if (existingUser) {
      return new NextResponse("User already onboarded", { status: 400 });
    }

    // 4. Create the new user in PostgreSQL with their chosen role
    const newUser = await db.user.create({
      data: {
        clerkUserId: clerkUser.id,
        email: clerkUser.emailAddresses[0].emailAddress,
        name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName}` : "Fleet User",
        role: role, 
      },
    });

    return NextResponse.json(newUser);
  } catch (error) {
    console.error("[ONBOARDING_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}