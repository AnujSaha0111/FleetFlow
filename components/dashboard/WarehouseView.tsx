"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// 1. Dynamic Import (Crucial for Maps in Next.js)
const RouteMap = dynamic(() => import("../../components/dashboard/RouteMap"), { 
  ssr: false, // Disable Server Side Rendering for this component
  loading: () => <div className="h-[400px] bg-gray-100 animate-pulse rounded-xl">Loading Map...</div>
});

export default function WarehouseView({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  
  // Map State
  const [coords, setCoords] = useState<{
    origin: [number, number] | null;
    dest: [number, number] | null;
  }>({ origin: null, dest: null });

  const [formData, setFormData] = useState({
    origin: "", destination: "", weight: "", volume: "",
  });

  // Helper to get Lat/Lng from City Name
  const getCoordinates = async (city: string) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${city}`);
      const data = await res.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)] as [number, number];
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMatches([]);
    setCoords({ origin: null, dest: null }); // Reset map

    try {
      // 1. Get Coordinates for the Map
      const originCoords = await getCoordinates(formData.origin);
      const destCoords = await getCoordinates(formData.destination);
      setCoords({ origin: originCoords, dest: destCoords });

      // 2. Run Optimization API
      const res = await fetch("/api/shipments", {
        method: "POST",
        body: JSON.stringify({ ...formData, userId }),
      });
      const data = await res.json();
      if (data.matches) setMatches(data.matches);

    } catch (error) {
      alert("Error calculating optimization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* SECTION 1: The Map & Input Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Input Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border h-fit">
          <h2 className="text-xl font-bold mb-4">📦 Find Trucks</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
             {/* Inputs */}
             <input 
               placeholder="Origin (e.g. Mumbai)" 
               className="w-full border p-2 rounded" 
               onChange={e => setFormData({...formData, origin: e.target.value})} 
             />
             <input 
               placeholder="Destination (e.g. Delhi)" 
               className="w-full border p-2 rounded" 
               onChange={e => setFormData({...formData, destination: e.target.value})} 
             />
             <div className="flex gap-2">
               <input type="number" placeholder="Weight (kg)" className="w-full border p-2 rounded" onChange={e => setFormData({...formData, weight: e.target.value})} />
               <input type="number" placeholder="Volume (m3)" className="w-full border p-2 rounded" onChange={e => setFormData({...formData, volume: e.target.value})} />
             </div>
             
             <button disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded font-bold">
               {loading ? "Calculating Route..." : "Search Fleet"}
             </button>
          </form>
        </div>

        {/* Right: The Map Display */}
        <div className="h-full min-h-[400px]">
           <RouteMap originCoords={coords.origin} destCoords={coords.dest} />
        </div>
      </div>

      {/* SECTION 2: The Results List (Same as before) */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-700 text-xl">Optimization Results</h3>
        {/* ... (Keep your existing mapping code here for the results list) ... */}
        {matches.map((truck) => (
          <div key={truck.id} className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-green-500 flex justify-between">
             {/* Copy the truck card design from the previous step */}
             <div>
               <h4 className="font-bold">{truck.truckType}</h4>
               <p>{truck.licensePlate}</p>
             </div>
             <div className="text-right">
               <span className="block font-bold">₹{truck.matchDetails.estimatedCost}</span>
               <button className="bg-black text-white px-3 py-1 rounded text-sm mt-1">Book</button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}