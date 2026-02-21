"use client";

import { useState, useEffect } from "react";

export default function DriverProfilesPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    licenseExpiry: "",
  });

  const fetchDrivers = async () => {
    const res = await fetch("/api/drivers");
    if (res.ok) {
      const data = await res.json();
      setDrivers(data);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({ name: "", licenseExpiry: "" });
        fetchDrivers();
      } else {
        alert("Failed to add driver.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if a license is expired today
  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Driver Profiles</h1>
        <p className="text-gray-500">Manage human resources, compliance, and safety scores.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Add Driver Form */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h2 className="text-xl font-bold mb-4">Onboard New Driver</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input 
                required
                placeholder="e.g. Alex Sharma" 
                className="w-full border border-gray-300 p-2 rounded-md"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Expiry Date</label>
              <input 
                required
                type="date"
                className="w-full border border-gray-300 p-2 rounded-md"
                value={formData.licenseExpiry}
                onChange={(e) => setFormData({...formData, licenseExpiry: e.target.value})}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold p-2 rounded-md hover:bg-blue-700 disabled:opacity-50 mt-4"
            >
              {loading ? "Adding..." : "+ Register Driver"}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Scannable Data Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 text-sm font-semibold text-gray-600">Driver Name</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">License Expiry</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Safety Score</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Duty Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {drivers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">No drivers onboarded yet.</td>
                  </tr>
                ) : (
                  drivers.map((d) => {
                    const expired = isExpired(d.licenseExpiry);
                    return (
                      <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-900">{d.name}</td>
                        <td className="p-4">
                          <span className={expired ? "text-red-600 font-bold" : "text-gray-600"}>
                            {new Date(d.licenseExpiry).toLocaleDateString()}
                            {expired && " (EXPIRED)"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {d.safetyScore}/100
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                            d.status === 'ON_DUTY' ? 'bg-green-100 text-green-700' : 
                            d.status === 'SUSPENDED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}