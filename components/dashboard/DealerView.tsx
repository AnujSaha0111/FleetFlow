"use client";

import { useState } from "react";
import { useEffect } from "react";

export default function DealerView({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  
  // We only need basic details to calculate optimization
  const [truck, setTruck] = useState({
    licensePlate: "",
    type: "Container",
    capacityWeight: "",
    capacityVolume: "",
    costPerKm: "",
  });

  const handleAddTruck = async () => {
    setLoading(true);
    await fetch("/api/trucks", {
      method: "POST",
      body: JSON.stringify({ ...truck, userId }),
    });
    setLoading(false);
    alert("Truck Added to Fleet!");
  };

  // Inside DealerView component
const [jobs, setJobs] = useState<any[]>([]);

// Add this useEffect to load jobs when page opens


useEffect(() => {
  const fetchJobs = async () => {
    // We need a new GET route for this, or just reuse an existing one.
    // For speed, let's create a quick API route: /api/trucks/jobs?userId=...
    const res = await fetch(`/api/trucks/jobs?userId=${userId}`);
    const data = await res.json();
    setJobs(data);
  };
  fetchJobs();
}, [userId]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border max-w-2xl">
      <h2 className="text-xl font-semibold mb-4">🚛 Add Truck to Fleet</h2>
      <div className="space-y-4">
        <input 
          placeholder="License Plate (e.g. MH-04-AB-1234)" 
          className="w-full border p-2 rounded"
          onChange={(e) => setTruck({...truck, licensePlate: e.target.value})}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <input 
            type="number" 
            placeholder="Max Weight (kg)" 
            className="border p-2 rounded"
            onChange={(e) => setTruck({...truck, capacityWeight: e.target.value})}
          />
          <input 
            type="number" 
            placeholder="Max Volume (m³)" 
            className="border p-2 rounded"
            onChange={(e) => setTruck({...truck, capacityVolume: e.target.value})}
          />
        </div>

        <input 
           type="number"
           placeholder="Cost per KM (₹)" 
           className="w-full border p-2 rounded"
           onChange={(e) => setTruck({...truck, costPerKm: e.target.value})}
        />

        <button 
          onClick={handleAddTruck}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
        >
          {loading ? "Adding..." : "Register Truck"}
        </button>

                <div className="mt-8 border-t pt-6">

                    <div className="flex justify-between items-center mb-4">
  
  
</div>
        <h3 className="text-xl font-bold mb-4">🚛 My Active Jobs</h3>
        <button 
    onClick={() => window.location.reload()} 
    className="text-sm text-blue-600 underline"
  >
    Refresh List
  </button>
        {jobs.length === 0 ? (
            <p className="text-gray-500">No shipments assigned yet.</p>
        ) : (
            <div className="grid gap-4">
            {jobs.map((job) => (
                <div key={job.id} className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                <div className="flex justify-between">
                    <span className="font-bold text-blue-800">Route: {job.origin} ➝ {job.destination}</span>
                    <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs">
                    {job.status}
                    </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                    <p>Cargo: {job.totalWeight}kg | {job.totalVolume}m³</p>
                    <p className="mt-1 font-semibold">Truck Assigned: {job.assignedTruck.licensePlate}</p>
                </div>
                </div>
            ))}
            </div>
        )}
</div>
      </div>
    </div>
  );
}