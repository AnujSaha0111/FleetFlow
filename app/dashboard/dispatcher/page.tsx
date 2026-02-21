"use client";

import { useState, useEffect } from "react";

export default function TripDispatcherPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    vehicleId: "",
    driverId: "",
    cargoWeight: "",
  });

  // Fetch all required data on load
  const fetchData = async () => {
    // Fetch Trips
    const tripsRes = await fetch("/api/trips");
    if (tripsRes.ok) setTrips(await tripsRes.json());

    // Fetch Vehicles (Filter to AVAILABLE on the frontend for simplicity)
    const vehRes = await fetch("/api/vehicles");
    if (vehRes.ok) {
      const allVehicles = await vehRes.json();
      setVehicles(allVehicles.filter((v: any) => v.status === "AVAILABLE"));
    }

    // Fetch Drivers (Filter to ON_DUTY and NOT EXPIRED)
    const drvRes = await fetch("/api/drivers");
    if (drvRes.ok) {
      const allDrivers = await drvRes.json();
      setDrivers(allDrivers.filter((d: any) => {
        const isNotExpired = new Date(d.licenseExpiry) >= new Date();
        return d.status === "ON_DUTY" && isNotExpired;
      }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({ vehicleId: "", driverId: "", cargoWeight: "" });
        fetchData(); // Refresh all tables and dropdowns
      } else {
        // Capture the exact error message from our backend validation
        const text = await res.text();
        setErrorMsg(text);
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("A network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Trip Dispatcher</h1>
        <p className="text-gray-500">Assign vehicles and drivers. Smart validation is active.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Dispatch Form */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h2 className="text-xl font-bold mb-4">Create New Trip</h2>
          
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm font-bold border border-red-200">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Available Vehicle</label>
              <select 
                required
                className="w-full border border-gray-300 p-2 rounded-md bg-white"
                value={formData.vehicleId}
                onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
              >
                <option value="" disabled>-- Choose a Vehicle --</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.maxLoadCapacity}kg max)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Active Driver</label>
              <select 
                required
                className="w-full border border-gray-300 p-2 rounded-md bg-white"
                value={formData.driverId}
                onChange={(e) => setFormData({...formData, driverId: e.target.value})}
              >
                <option value="" disabled>-- Choose a Driver --</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name} (Score: {d.safetyScore})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Weight (kg)</label>
              <input 
                required
                type="number" 
                placeholder="e.g. 450" 
                className="w-full border border-gray-300 p-2 rounded-md"
                value={formData.cargoWeight}
                onChange={(e) => setFormData({...formData, cargoWeight: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || vehicles.length === 0 || drivers.length === 0}
              className="w-full bg-blue-600 text-white font-bold p-3 rounded-md hover:bg-blue-700 disabled:opacity-50 mt-4 transition-colors"
            >
              {loading ? "Dispatching..." : "🚀 Dispatch Trip"}
            </button>
            
            {(vehicles.length === 0 || drivers.length === 0) && (
              <p className="text-xs text-gray-500 text-center mt-2">
                *You need at least 1 Available Vehicle and 1 Active Driver to dispatch.
              </p>
            )}
          </form>
        </div>

        {/* RIGHT COLUMN: Active & Dispatched Trips Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-700">Dispatch Log</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 text-sm font-semibold text-gray-600">ID</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Vehicle</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Driver</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Cargo</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {trips.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">No trips dispatched yet.</td>
                  </tr>
                ) : (
                  trips.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-xs font-mono text-gray-500">{t.id.slice(0, 8)}...</td>
                      <td className="p-4 font-medium text-gray-900">{t.vehicle?.name}</td>
                      <td className="p-4 text-gray-600">{t.driver?.name}</td>
                      <td className="p-4 text-gray-600 font-bold">{t.cargoWeight} kg</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          t.status === 'DISPATCHED' ? 'bg-blue-100 text-blue-700' : 
                          t.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {t.status}
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