import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // 1. Authenticate with Clerk
  const clerkUser = await currentUser();
  if (!clerkUser) return redirect("/sign-in");

  // 2. State Sync: Ensure user exists in PostgreSQL
  let dbUser = await db.user.findUnique({
    where: { clerkUserId: clerkUser.id },
  });

 if (!dbUser) {
    redirect("/");
  }

  // 3. Define the Master Navigation List
  const ALL_ROUTES = {
    commandCenter: { name: "Command Center", path: "/dashboard", icon: "📊" },
    vehicles: { name: "Vehicle Registry", path: "/dashboard/vehicles", icon: "🚛" },
    drivers: { name: "Driver Profiles", path: "/dashboard/drivers", icon: "👨‍✈️" },
    dispatcher: { name: "Trip Dispatcher", path: "/dashboard/dispatcher", icon: "🗺️" },
    activeTrips: { name: "Active Logs", path: "/dashboard/active-trips", icon: "🛣️" },
    maintenance: { name: "Maintenance", path: "/dashboard/maintenance", icon: "🔧" },
    analytics: { name: "Analytics", path: "/dashboard/analytics", icon: "📈" },
  };

  // 4. Implement Role-Based Access Control (RBAC) Filtering
  let allowedNavItems: any[] = [];

  switch (dbUser.role) {
    case "MANAGER":
      // Managers see everything
      allowedNavItems = Object.values(ALL_ROUTES);
      break;
    case "DISPATCHER":
      // Dispatchers only handle trips and vehicles
      allowedNavItems = [
        ALL_ROUTES.commandCenter,
        ALL_ROUTES.vehicles,
        ALL_ROUTES.dispatcher,
        ALL_ROUTES.activeTrips,
      ];
      break;
    case "SAFETY_OFFICER":
      // Safety focuses on humans and hardware health
      allowedNavItems = [
        ALL_ROUTES.commandCenter,
        ALL_ROUTES.drivers,
        ALL_ROUTES.maintenance,
      ];
      break;
    case "FINANCIAL_ANALYST":
      // Analysts focus on money and logs
      allowedNavItems = [
        ALL_ROUTES.commandCenter,
        ALL_ROUTES.analytics,
        ALL_ROUTES.activeTrips,
      ];
      break;
    default:
      allowedNavItems = [ALL_ROUTES.commandCenter];
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* Client-Side Sidebar fed with Server-Side permissions */}
      <Sidebar 
        navItems={allowedNavItems} 
        role={dbUser.role} 
        userName={dbUser.name}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-black"><span className="text-blue-500">Fleet</span>Flow</h2>
          <span className="text-xs bg-gray-800 px-2 py-1 rounded">{dbUser.role}</span>
        </div>
        
        {children}
      </main>

    </div>
  );
}