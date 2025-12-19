"use client";

import Link from "next/link";
import { UserButton, useUser, SignInButton } from "@clerk/nextjs";

export default function Navbar() {
  const { isSignedIn, user } = useUser();

  return (
    <nav className="bg-white border-b border-gray-200 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          
          {/* LEFT: Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="bg-blue-600 text-white p-2 rounded-lg font-bold text-xl">SL</span>
              <span className="text-xl font-bold text-gray-900 tracking-tight">SmartLogistics</span>
            </Link>
          </div>

          {/* RIGHT: Navigation Links & Auth */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium transition">
              Home
            </Link>
            <Link href="/features" className="text-gray-600 hover:text-blue-600 font-medium transition">
            Features
            </Link>

            {isSignedIn ? (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition">
                  Dashboard
                </Link>
                
                {/* User Profile Dropdown (Handled by Clerk) */}
                <div className="flex items-center gap-3 pl-4 border-l">
                  <span className="text-sm text-gray-500 hidden md:block">
                    Hi, {user.firstName}
                  </span>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </>
            ) : (
              // Show Login Button if not signed in
              <div className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition">
                <SignInButton mode="modal" />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}