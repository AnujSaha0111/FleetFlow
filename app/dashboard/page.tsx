import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function CommandCenterPage() {
  // 1. Get the session from Clerk
  const clerkUser = await currentUser();
  if (!clerkUser) return redirect("/sign-in");

  // 2. State Synchronization: Check if user exists in our local PostgreSQL DB
  let dbUser = await db.user.findUnique({
    where: { clerkUserId: clerkUser.id },
  });

  // 3. If they don't exist (because we wiped the DB), create them!
  if (!dbUser) {
    dbUser = await db.user.create({
      data: {
        clerkUserId: clerkUser.id,
        email: clerkUser.emailAddresses[0].emailAddress,
        name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName}` : "Fleet User",
        // Give yourself the MANAGER role so you can build and test everything
        role: "MANAGER", 
      },
    });
  }

  // 4. Fetch the High-Level KPIs for the Command Center
  // (Right now these will be 0, but we will wire them up next)
  const activeFleet = await db.vehicle.count({ where: { status: "ON_TRIP" } });
  const maintenanceAlerts = await db.vehicle.count({ where: { status: "IN_SHOP" } });
  const totalVehicles = await db.vehicle.count();
  
  const utilizationRate = totalVehicles === 0 
    ? 0 
    : Math.round((activeFleet / totalVehicles) * 100);

  // 5. Render the Command Center UI
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">FleetFlow Command Center</h1>
        <p className="text-gray-500">Welcome back, {dbUser.name} | Role: {dbUser.role}</p>
      </div>

      {/* KPI Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-blue-500">
          <p className="text-sm font-medium text-gray-500">Active Fleet (On Trip)</p>
          <p className="text-4xl font-black text-gray-900 mt-2">{activeFleet}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-red-500">
          <p className="text-sm font-medium text-gray-500">Maintenance Alerts</p>
          <p className="text-4xl font-black text-gray-900 mt-2">{maintenanceAlerts}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-green-500">
          <p className="text-sm font-medium text-gray-500">Utilization Rate</p>
          <p className="text-4xl font-black text-gray-900 mt-2">{utilizationRate}%</p>
        </div>
      </div>

      {/* Placeholder for Data Tables */}
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl h-64 flex items-center justify-center text-gray-500">
        Vehicle & Trip Data Tables will go here...
      </div>
    </div>
  );
}