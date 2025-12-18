import { db } from "../../lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import WarehouseView from "../../components/dashboard/WarehouseView";
import DealerView from "../../components/dashboard/DealerView";

export default async function DashboardPage() {
  const user = await currentUser();
  
  if (!user) return redirect("/sign-in");

  // Fetch the user's profile from our Postgres DB
  const dbUser = await db.user.findUnique({
    where: { clerkUserId: user.id },
  });

  // If they haven't finished onboarding, send them back
  if (!dbUser) return redirect("/onboarding");

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Logistics Dashboard</h1>
        <div className="bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium">
          Role: <span className="text-blue-600">{dbUser.role}</span>
        </div>
      </div>

      {/* Conditional Rendering based on Role */}
      {dbUser.role === "WAREHOUSE" ? (
        <WarehouseView userId={dbUser.id} />
      ) : (
        <DealerView userId={dbUser.id} />
      )}
    </div>
  );
}