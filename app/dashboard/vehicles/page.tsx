"use client";

import { useState, useEffect } from "react";

export default function VehicleRegistryPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    licensePlate: "",
    maxLoadCapacity: "",
    odometer: "",
  });

  // Fetch Vehicles on Load
  const fetchVehicles = async () => {
    const res = await fetch("/api/vehicles");
    if (res.ok) {
      const data = await res.json();
      setVehicles(data);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({ name: "", licensePlate: "", maxLoadCapacity: "", odometer: "" }); // Reset form
        fetchVehicles(); // Refresh the table
      } else {
        alert("Failed to add vehicle. Ensure License Plate is unique.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Vehicle Registry</h1>
        <p className="text-gray-500">Manage your fleet assets and monitor statuses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Add Vehicle Form */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h2 className="text-xl font-bold mb-4">Add New Asset</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Name/Model</label>
              <input 
                required
                placeholder="e.g. Tata 407 Van" 
                className="w-full border border-gray-300 p-2 rounded-md"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
              <input 
                required
                placeholder="e.g. MH-12-AB-1234" 
                className="w-full border border-gray-300 p-2 rounded-md uppercase"
                value={formData.licensePlate}
                onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Capacity (kg)</label>
                <input 
                  required
                  type="number" 
                  placeholder="e.g. 500" 
                  className="w-full border border-gray-300 p-2 rounded-md"
                  value={formData.maxLoadCapacity}
                  onChange={(e) => setFormData({...formData, maxLoadCapacity: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Odometer (km)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 15000" 
                  className="w-full border border-gray-300 p-2 rounded-md"
                  value={formData.odometer}
                  onChange={(e) => setFormData({...formData, odometer: e.target.value})}
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold p-2 rounded-md hover:bg-blue-700 disabled:opacity-50 mt-4"
            >
              {loading ? "Adding..." : "+ Register Vehicle"}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Scannable Data Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 text-sm font-semibold text-gray-600">Name</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">License Plate</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Capacity</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Odometer</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">No vehicles registered yet.</td>
                  </tr>
                ) : (
                  vehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{v.name}</td>
                      <td className="p-4 text-gray-600 uppercase tracking-wide">{v.licensePlate}</td>
                      <td className="p-4 text-gray-600">{v.maxLoadCapacity} kg</td>
                      <td className="p-4 text-gray-600">{v.odometer} km</td>
                      <td className="p-4">
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700">
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}