"use client";

import { useState, useEffect } from "react";

export default function MaintenancePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    vehicleId: "",
    description: "",
    cost: "",
  });

  const fetchData = async () => {
    // Fetch Logs
    const logRes = await fetch("/api/maintenance");
    if (logRes.ok) setLogs(await logRes.json());

    // Fetch Vehicles to populate dropdown (Only AVAILABLE ones can be sent to shop)
    // and to show which ones are currently IN_SHOP
    const vehRes = await fetch("/api/vehicles");
    if (vehRes.ok) setVehicles(await vehRes.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({ vehicleId: "", description: "", cost: "" });
        fetchData(); // Refresh logs and vehicle statuses
      } else {
        alert("Failed to log maintenance.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRelease = async (vehicleId: string) => {
    try {
      const res = await fetch("/api/maintenance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId }),
      });

      if (res.ok) {
        fetchData(); // Refresh the UI
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Filter vehicles for the UI
  const availableVehicles = vehicles.filter((v) => v.status === "AVAILABLE");
  const inShopVehicles = vehicles.filter((v) => v.status === "IN_SHOP");

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Maintenance & Service Logs</h1>
        <p className="text-gray-500">Track preventative health, repairs, and auto-lock broken vehicles.</p>
      </div>

      {/* Alert Banner for In-Shop Vehicles */}
      {inShopVehicles.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div>
            <h3 className="text-red-800 font-bold flex items-center gap-2">
              ⚠️ Vehicles Currently In Shop ({inShopVehicles.length})
            </h3>
            <p className="text-red-600 text-sm">These are hidden from the Dispatcher.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {inShopVehicles.map(v => (
              <div key={v.id} className="bg-white px-3 py-2 rounded shadow-sm border border-red-100 flex items-center gap-3">
                <span className="font-bold text-sm">{v.name} ({v.licensePlate})</span>
                <button 
                  onClick={() => handleRelease(v.id)}
                  className="bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded text-xs font-bold transition-colors"
                >
                  Mark Fixed
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Service Form */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h2 className="text-xl font-bold mb-4">Log Service Ticket</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Vehicle</label>
              <select 
                required
                className="w-full border border-gray-300 p-2 rounded-md bg-white"
                value={formData.vehicleId}
                onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
              >
                <option value="" disabled>-- Choose a Vehicle --</option>
                {availableVehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.licensePlate})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Description</label>
              <input 
                required
                placeholder="e.g. Oil Change & Brake Pads" 
                className="w-full border border-gray-300 p-2 rounded-md"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost (₹)</label>
              <input 
                required
                type="number" 
                placeholder="e.g. 1500" 
                className="w-full border border-gray-300 p-2 rounded-md"
                value={formData.cost}
                onChange={(e) => setFormData({...formData, cost: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || availableVehicles.length === 0}
              className="w-full bg-red-600 text-white font-bold p-3 rounded-md hover:bg-red-700 disabled:opacity-50 mt-4 transition-colors"
            >
              {loading ? "Logging..." : "🔧 Log Service & Lock Vehicle"}
            </button>
            
            {availableVehicles.length === 0 && (
              <p className="text-xs text-gray-500 text-center mt-2">
                *No available vehicles to send to the shop.
              </p>
            )}
          </form>
        </div>

        {/* RIGHT COLUMN: Scannable Log History */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-bold text-gray-700">Maintenance History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 text-sm font-semibold text-gray-600">Date</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Vehicle</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Issue / Description</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">No maintenance logs recorded yet.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-sm text-gray-500">
                        {new Date(log.date).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-medium text-gray-900">{log.vehicle?.name}</td>
                      <td className="p-4 text-gray-600">{log.description}</td>
                      <td className="p-4 text-gray-900 font-bold">₹{log.cost}</td>
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