"use client";

import { useState, useEffect } from "react";

export default function ActiveTripsPage() {
  const [activeTrips, setActiveTrips] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // State to hold form inputs for multiple cards
  const [logs, setLogs] = useState<Record<string, { odo: string, liters: string, cost: string }>>({});

  const fetchActiveTrips = async () => {
    const res = await fetch("/api/trips");
    if (res.ok) {
      const allTrips = await res.json();
      // Only show trips currently on the road
      setActiveTrips(allTrips.filter((t: any) => t.status === "DISPATCHED"));
    }
  };

  useEffect(() => {
    fetchActiveTrips();
  }, []);

  const handleInputChange = (tripId: string, field: string, value: string) => {
    setLogs(prev => ({
      ...prev,
      [tripId]: {
        ...prev[tripId],
        [field]: value
      }
    }));
  };

  const handleCompleteTrip = async (tripId: string, vehicleId: string) => {
    const tripLog = logs[tripId];
    
    if (!tripLog?.odo) {
      alert("Please enter the final odometer reading.");
      return;
    }

    setLoadingId(tripId);

    try {
      const res = await fetch("/api/trips/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId,
          vehicleId,
          finalOdometer: tripLog.odo,
          fuelLiters: tripLog.liters,
          fuelCost: tripLog.cost,
        }),
      });

      if (res.ok) {
        fetchActiveTrips(); // Removes the trip from the screen
      } else {
        alert("Failed to complete trip.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Active Trips & Logbook</h1>
        <p className="text-gray-500">Mark trips as completed, update odometers, and log fuel expenses.</p>
      </div>

      {activeTrips.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-500">
          <p className="text-lg font-bold">No active trips right now.</p>
          <p className="text-sm">Head over to the Dispatcher to assign a new trip.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTrips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              
              {/* Card Header */}
              <div className="bg-blue-600 text-white p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{trip.vehicle.name}</h3>
                    <p className="text-blue-100 text-sm">{trip.vehicle.licensePlate}</p>
                  </div>
                  <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold border border-white/30">
                    {trip.cargoWeight} kg
                  </span>
                </div>
                <p className="text-sm mt-2 font-medium">Driver: {trip.driver.name}</p>
              </div>

              {/* Form Area */}
              <div className="p-4 space-y-4 flex-1 bg-gray-50">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Final Odometer (km) *</label>
                  <input 
                    type="number" 
                    placeholder={`Current: ${trip.vehicle.odometer}`}
                    className="w-full border border-gray-300 p-2 rounded-md text-sm"
                    value={logs[trip.id]?.odo || ""}
                    onChange={(e) => handleInputChange(trip.id, "odo", e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Fuel Added (L)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 40"
                      className="w-full border border-gray-300 p-2 rounded-md text-sm"
                      value={logs[trip.id]?.liters || ""}
                      onChange={(e) => handleInputChange(trip.id, "liters", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Fuel Cost (₹)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 3800"
                      className="w-full border border-gray-300 p-2 rounded-md text-sm"
                      value={logs[trip.id]?.cost || ""}
                      onChange={(e) => handleInputChange(trip.id, "cost", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="p-4 border-t bg-white">
                <button 
                  onClick={() => handleCompleteTrip(trip.id, trip.vehicle.id)}
                  disabled={loadingId === trip.id}
                  className="w-full bg-green-600 text-white font-bold py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {loadingId === trip.id ? "Saving Log..." : "✅ Complete Trip"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}