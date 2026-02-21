"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

interface NavItem {
  name: string;
  path: string;
  icon: string;
}

interface SidebarProps {
  navItems: NavItem[];
  role: string;
  userName: string | null;
}

export default function Sidebar({ navItems, role, userName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col hidden md:flex">
      <div className="p-6">
        <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
          <span className="text-blue-500">Fleet</span>Flow
        </h2>
        <p className="text-xs text-gray-400 mt-1 font-mono bg-gray-800 inline-block px-2 py-1 rounded mt-2">
          ROLE: {role}
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <span className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}>
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 bg-gray-950 border-t border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <UserButton afterSignOutUrl="/" />
          <span className="text-sm font-medium text-gray-300 truncate">
            {userName}
          </span>
        </div>
      </div>
    </aside>
  );
}