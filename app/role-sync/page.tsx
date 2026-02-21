import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function RoleSyncPage({
  searchParams,
}: {
  searchParams: { role?: string };
}) {
  // 1. Get the authenticated Clerk user
  const user = await currentUser();
  if (!user) redirect("/");

  // 2. Read the role from the URL (default to DISPATCHER if missing)
  const chosenRole = searchParams.role || "DISPATCHER";

  // 3. Check if they already exist in our database
  let dbUser = await db.user.findUnique({
    where: { clerkUserId: user.id },
  });

  // 4. If they don't exist, create them with the chosen role
  if (!dbUser) {
    dbUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: user.firstName ? `${user.firstName} ${user.lastName}` : "Fleet User",
        role: chosenRole as any, // Casts the string to our Prisma Enum
      },
    });
  }

  // 5. Instantly redirect them to their customized dashboard
  redirect("/dashboard");
}