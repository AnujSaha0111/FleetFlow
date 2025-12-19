import Link from "next/link";
import { SignedOut, SignUpButton } from "@clerk/nextjs";

export default function FeaturesPage() {
  return (
    <div className="bg-white">
      {/* 1. Header Section */}
      <div className="bg-blue-900 py-20 text-center text-white">
        <h1 className="text-4xl font-bold mb-4">One Platform. Two Solutions.</h1>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
          Whether you are shipping goods or managing a fleet, our AI optimization engine 
          maximizes efficiency for everyone.
        </p>
      </div>

      {/* 2. For Warehouses (The Shippers) */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <div className="bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full inline-block text-sm mb-4">
              FOR WAREHOUSES
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Stop Paying for "Air". Ship Smarter.
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Traditional logistics forces you to book entire trucks even for partial loads. 
              Our system analyzes your shipment's volume and weight to find the perfect vehicle match.
            </p>
            
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="bg-green-100 text-green-700 p-2 rounded-lg mr-4">💰</span>
                <div>
                  <h4 className="font-bold">Cost Optimization</h4>
                  <p className="text-sm text-gray-500">Save up to 30% by booking only the space you need.</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-green-100 text-green-700 p-2 rounded-lg mr-4">🌍</span>
                <div>
                  <h4 className="font-bold">CO₂ Tracking</h4>
                  <p className="text-sm text-gray-500">Visual reports on your carbon footprint reduction.</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-green-100 text-green-700 p-2 rounded-lg mr-4">📍</span>
                <div>
                  <h4 className="font-bold">Live Route Map</h4>
                  <p className="text-sm text-gray-500">Real-time tracking from pickup to delivery using OpenStreetMap.</p>
                </div>
              </li>
            </ul>
          </div>
          
          {/* Visual Representation for Warehouse */}
          <div className="md:w-1/2 bg-gray-100 rounded-2xl p-8 border border-gray-200 shadow-inner">
             <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-4 border-b pb-4">
                  <span className="font-bold">Shipment #4092</span>
                  <span className="text-green-600 font-bold">Optimization: 92%</span>
                </div>
                <div className="space-y-3">
                   <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                   <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="mt-6 flex gap-2">
                   <div className="h-20 w-20 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">Box A</div>
                   <div className="h-20 w-20 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">Box B</div>
                   <div className="h-20 w-20 bg-gray-300 rounded-lg border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500 text-xs text-center p-1">Empty Space Minimized</div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 3. For Dealers (The Fleet Owners) */}
      <section className="py-20 px-4 max-w-7xl mx-auto bg-gray-50 border-t">
        <div className="flex flex-col md:flex-row-reverse items-center gap-12">
          <div className="md:w-1/2">
            <div className="bg-purple-100 text-purple-800 font-bold px-3 py-1 rounded-full inline-block text-sm mb-4">
              FOR TRUCK DEALERS
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Zero Empty Returns. Max Utilization.
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              The biggest loss in trucking is the "Empty Return" trip. Our platform automatically 
              matches your trucks with return loads from nearby warehouses.
            </p>
            
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="bg-purple-100 text-purple-700 p-2 rounded-lg mr-4">🚛</span>
                <div>
                  <h4 className="font-bold">Consistent Jobs</h4>
                  <p className="text-sm text-gray-500">Get booking requests directly to your dashboard.</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-purple-100 text-purple-700 p-2 rounded-lg mr-4">📈</span>
                <div>
                  <h4 className="font-bold">Fleet Analytics</h4>
                  <p className="text-sm text-gray-500">Track which trucks are earning the most revenue.</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-purple-100 text-purple-700 p-2 rounded-lg mr-4">⚡</span>
                <div>
                  <h4 className="font-bold">Instant Booking</h4>
                  <p className="text-sm text-gray-500">Accept or reject jobs with a single click.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Visual Representation for Dealer */}
          <div className="md:w-1/2 bg-white rounded-2xl p-8 border border-gray-200 shadow-xl">
             <h3 className="font-bold text-gray-500 mb-4 uppercase text-xs tracking-wider">Dealer Dashboard Preview</h3>
             <div className="space-y-3">
                <div className="flex justify-between items-center p-3 border rounded-lg bg-green-50 border-green-200">
                   <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-200 flex items-center justify-center">✓</div>
                      <div>
                        <div className="font-bold text-gray-900">Truck MH-04-AB-1234</div>
                        <div className="text-xs text-gray-500">Job Assigned • Mumbai to Pune</div>
                      </div>
                   </div>
                   <span className="font-bold text-green-700">Active</span>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                   <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">-</div>
                      <div>
                        <div className="font-bold text-gray-900">Truck DL-11-XY-9876</div>
                        <div className="text-xs text-gray-500">Waiting for assignment</div>
                      </div>
                   </div>
                   <span className="font-bold text-gray-400">Idle</span>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 4. Call to Action */}
      <div className="bg-black py-16 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to optimize your supply chain?</h2>
        <div className="flex justify-center gap-4 mt-8">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                  Create Free Account
                </button>
              </SignUpButton>
            </SignedOut>
            
            <Link href="/dashboard" className="bg-transparent border border-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-black transition">
               Go to Dashboard
            </Link>
        </div>
      </div>
    </div>
  );
}