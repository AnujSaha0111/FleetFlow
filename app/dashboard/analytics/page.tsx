"use client";

import { useState, useEffect } from "react";

export default function AnalyticsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const res = await fetch("/api/analytics");
      if (res.ok) {
        setData(await res.json());
      }
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  // Fleet-wide Totals Calculation
  const fleetTotalOdo = data.reduce((sum, v) => sum + v.odometer, 0);
  const fleetTotalCost = data.reduce((sum, v) => sum + v.totalOperationalCost, 0);
  const fleetAvgCostPerKm = fleetTotalOdo > 0 ? (fleetTotalCost / fleetTotalOdo).toFixed(2) : "0.00";

  // CSV Export Function
  const exportToCSV = () => {
    const headers = ["Vehicle", "License Plate", "Odometer (km)", "Total Fuel (L)", "Fuel Cost", "Maintenance Cost", "Total Cost", "Efficiency (km/L)", "Cost per km"];
    const rows = data.map(v => [
      v.name, 
      v.licensePlate, 
      v.odometer, 
      v.totalFuelLiters, 
      v.totalFuelCost, 
      v.totalMaintenanceCost, 
      v.totalOperationalCost, 
      v.fuelEfficiency, 
      v.costPerKm
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `fleet_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Fleet Analytics...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Operational Analytics</h1>
          <p className="text-gray-500">Financial reports, efficiency metrics, and ROI tracking.</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="bg-gray-900 text-white px-4 py-2 rounded-md font-bold hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          ⬇️ Export CSV Report
        </button>
      </div>

      {/* Fleet-Wide Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Fleet Mileage</p>
          <p className="text-3xl font-black text-gray-900 mt-2">{fleetTotalOdo.toLocaleString()} <span className="text-lg text-gray-400 font-medium">km</span></p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Operational Spend</p>
          <p className="text-3xl font-black text-red-600 mt-2">₹{fleetTotalCost.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm bg-blue-50 border-blue-200">
          <p className="text-sm font-medium text-blue-800">Fleet Avg. Cost per km</p>
          <p className="text-3xl font-black text-blue-900 mt-2">₹{fleetAvgCostPerKm}</p>
        </div>
      </div>

      {/* Detailed Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-sm font-semibold text-gray-600">Vehicle</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Odometer</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Fuel & Maint. Cost</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Efficiency</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Cost/km</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No data available.</td>
                </tr>
              ) : (
                data.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{v.name}</p>
                      <p className="text-xs text-gray-500 uppercase">{v.licensePlate}</p>
                    </td>
                    <td className="p-4 text-gray-600 font-mono">{v.odometer} km</td>
                    <td className="p-4 text-gray-900">
                      ₹{v.totalOperationalCost}
                      <span className="block text-xs text-gray-400">
                        (F: ₹{v.totalFuelCost} | M: ₹{v.totalMaintenanceCost})
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">
                        {v.fuelEfficiency} km/L
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">
                        ₹{v.costPerKm} / km
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
  );
}