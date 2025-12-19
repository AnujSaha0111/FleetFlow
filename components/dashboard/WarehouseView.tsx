"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useEffect } from "react";

// 1. Dynamic Import (Crucial for Maps in Next.js)
// Note: We use '@/components/RouteMap' to find the file safely
const RouteMap = dynamic(() => import("../../components/dashboard/RouteMap"), { 
  ssr: false, 
  loading: () => <div className="h-[400px] bg-gray-100 animate-pulse rounded-xl">Loading Map...</div>
});

export default function WarehouseView({ userId }: { userId: string }) {
  // --- STATE VARIABLES (Must be inside the function) ---
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [currentShipmentId, setCurrentShipmentId] = useState<string | null>(null);
  const [myShipments, setMyShipments] = useState<any[]>([]);

  // Add this useEffect to load history
useEffect(() => {
  const fetchMyShipments = async () => {
    // We will create a quick GET route for this
    const res = await fetch(`/api/shipments/user?userId=${userId}`);
    if (res.ok) {
       const data = await res.json();
       setMyShipments(data);
    }
  };
  fetchMyShipments();
}, [userId]);
  
  // Map State
  const [coords, setCoords] = useState<{
    origin: [number, number] | null;
    dest: [number, number] | null;
  }>({ origin: null, dest: null });

  const [formData, setFormData] = useState({
    origin: "", destination: "", weight: "", volume: "",
  });

  // --- HELPER FUNCTIONS ---

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
    setCoords({ origin: null, dest: null });
    setCurrentShipmentId(null); // Reset ID on new search

    try {
      const originCoords = await getCoordinates(formData.origin);
      const destCoords = await getCoordinates(formData.destination);
      setCoords({ origin: originCoords, dest: destCoords });

      const res = await fetch("/api/shipments", {
        method: "POST",
        body: JSON.stringify({ ...formData, userId }),
      });
      
      const data = await res.json();
      
      // CRITICAL: Save the shipment ID so we can book it later
      if (data.shipmentId) setCurrentShipmentId(data.shipmentId); 
      if (data.matches) setMatches(data.matches);

    } catch (error) {
      alert("Error calculating optimization");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (truckId: string) => {
    if (!currentShipmentId) {
      alert("Error: No active shipment found. Please search again.");
      return;
    }
    
    if (!confirm("Confirm booking for this truck?")) return;

    try {
      const res = await fetch("/api/shipments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          shipmentId: currentShipmentId, 
          truckId: truckId 
        }),
      });

      if (res.ok) {
        alert("✅ Truck Booked Successfully!");
        setMatches([]); 
        setCurrentShipmentId(null);
        // Optional: Refresh page to clear form
        // window.location.reload(); 
      } else {
        alert("Failed to book truck.");
      }
    } catch (error) {
      console.error(error);
      alert("Connection Error");
    }
  };

  // --- RENDER ---
  return (
    <div className="space-y-8">
      {/* SECTION 1: The Map & Input Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Input Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border h-fit">
          <h2 className="text-xl font-bold mb-4">📦 Find Trucks</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
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

      {/* SECTION 2: The Results List */}
      <div className="space-y-4">
        {matches.length > 0 && <h3 className="font-bold text-gray-700 text-xl">Optimization Results</h3>}
        
        {matches.map((truck) => (
          <div key={truck.id} className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-green-500 flex justify-between">
             <div>
               <h4 className="font-bold">{truck.truckType}</h4>
               <p className="text-sm text-gray-500">{truck.licensePlate}</p>
               <div className="mt-1 text-xs text-green-700 bg-green-100 inline-block px-2 py-1 rounded">
                 Utilization: {truck.matchDetails.utilization}
               </div>
             </div>
             <div className="text-right">
               <span className="block font-bold text-lg">₹{truck.matchDetails.estimatedCost}</span>
               <button 
                  onClick={() => handleBook(truck.id)} 
                  className="bg-black text-white px-4 py-2 rounded text-sm mt-2 hover:bg-gray-800 transition"
               >
                 Book Now
               </button>
             </div>
          </div>
        ))}
      </div>
      {/* SECTION 3: Shipment History */}
<div className="mt-12 border-t pt-8">
  <h3 className="text-xl font-bold mb-6">📦 My Shipment History</h3>
  
  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
    {myShipments.map((ship) => (
      <div key={ship.id} className="bg-white p-5 rounded-xl border shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-gray-500 text-xs">ID: {ship.id.slice(0,8)}</span>
            <h4 className="font-bold">{ship.origin} ➝ {ship.destination}</h4>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-bold ${
             ship.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {ship.status}
          </span>
        </div>

        {/* Status Steps */}
        <div className="flex items-center mt-4 mb-4 text-xs text-gray-500">
           <div className={`flex-1 h-1 ${ship.status !== 'PENDING' ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
           <div className={`flex-1 h-1 ${['IN_TRANSIT', 'DELIVERED'].includes(ship.status) ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
           <div className={`flex-1 h-1 ${ship.status === 'DELIVERED' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
        </div>

        {/* The Green Report (Only if Delivered) */}
        {ship.status === 'DELIVERED' && (
          <div className="bg-green-50 p-3 rounded-lg mt-3 border border-green-100">
             <p className="text-green-800 font-bold text-sm">🌱 Impact Report</p>
             <div className="flex justify-between text-sm mt-1">
                <span>CO₂ Saved:</span>
                <span className="font-bold">{ship.co2Saved} kg</span>
             </div>
             <div className="flex justify-between text-sm">
                <span>Total Cost:</span>
                <span className="font-bold">₹{ship.estimatedCost}</span>
             </div>
          </div>
        )}
      </div>
    ))}
  </div>
</div>
    </div>
  );
}