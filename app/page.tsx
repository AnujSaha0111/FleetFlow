import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton, SignUpButton, SignInButton } from "@clerk/nextjs";

export default async function HomePage() {
  const { userId } = await auth();

  const roles = [
    { id: "MANAGER", title: "Fleet Manager", icon: "🏢", desc: "Full access to oversee all operations and assets." },
    { id: "DISPATCHER", title: "Dispatcher", icon: "🗺️", desc: "Assign trips, manage cargo, and track vehicles." },
    { id: "SAFETY_OFFICER", title: "Safety Officer", icon: "🛡️", desc: "Monitor driver compliance and maintenance." },
    { id: "FINANCIAL_ANALYST", title: "Financial Analyst", icon: "📈", desc: "Audit fuel spend, ROI, and costs." },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center gap-2">
            <span className="text-2xl font-black text-gray-900 tracking-tight">
              <span className="text-blue-600">Fleet</span>Flow
            </span>
          </div>
          <div className="flex items-center gap-4">
            {userId ? (
              <>
                <Link href="/dashboard" className="text-sm font-bold text-gray-600 hover:text-blue-600">
                  Go to Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
                <button className="text-sm font-bold text-gray-600 hover:text-blue-600">
                  Existing User Login
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="px-6 pt-14 lg:px-8 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Intelligent Fleet Logistics
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto mb-10">
          Select your operational role below to sign up and configure your personalized workspace.
        </p>

        {/* Role Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {roles.map((role) => (
            <SignUpButton 
              key={role.id} 
              mode="modal" 
              fallbackRedirectUrl={`/role-sync?role=${role.id}`} // <-- Passes the role in the URL
            >
              <button className="p-8 rounded-2xl border-2 border-gray-200 bg-white hover:border-blue-600 hover:shadow-lg transition-all group flex flex-col h-full">
                <div className="text-4xl mb-4">{role.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900">{role.title}</h3>
                <p className="mt-2 text-gray-500 flex-grow">{role.desc}</p>
                <div className="mt-6 text-blue-600 font-bold group-hover:translate-x-2 transition-transform">
                  Login as {role.title} →
                </div>
              </button>
            </SignUpButton>
          ))}
        </div>
      </div>
    </div>
  );
}