"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [role, setRole] = useState<"WAREHOUSE" | "DEALER">("WAREHOUSE");
  const [loading, setLoading] = useState(false);

  // If user somehow gets here but is already set up, redirect (optional safety)
  // For now, we keep it simple.

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: role,
          phone: "0000000000", // Placeholder, you can add an input for this later
        }),
      });

      if (res.ok) {
        router.push("/dashboard"); // Redirect to main app
        router.refresh();
      } else {
        alert("Something went wrong");
      }
    } catch (error) {
      console.error(error);
      alert("Error saving profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Welcome, {user?.firstName}!</h1>
        <p className="text-gray-600 mb-6">Select your account type to get started.</p>

        <div className="space-y-4 mb-6">
          <button
            onClick={() => setRole("WAREHOUSE")}
            className={`w-full p-4 rounded-lg border-2 flex items-center justify-between ${
              role === "WAREHOUSE"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
          >
            <div className="text-left">
              <span className="block font-semibold">I am a Warehouse</span>
              <span className="text-sm text-gray-500">I have goods to ship</span>
            </div>
            {role === "WAREHOUSE" && <span className="text-blue-600">✔</span>}
          </button>

          <button
            onClick={() => setRole("DEALER")}
            className={`w-full p-4 rounded-lg border-2 flex items-center justify-between ${
              role === "DEALER"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
          >
            <div className="text-left">
              <span className="block font-semibold">I am a Truck Dealer</span>
              <span className="text-sm text-gray-500">I have trucks to rent</span>
            </div>
            {role === "DEALER" && <span className="text-blue-600">✔</span>}
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Setting up..." : "Continue to Dashboard"}
        </button>
      </div>
    </div>
  );
}