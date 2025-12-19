import Link from "next/link";
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      
      {/* Hero Section */}
      <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl mb-6">
        Optimize Your Logistics <br />
        <span className="text-blue-600">Maximize Efficiency.</span>
      </h1>
      
      <p className="max-w-2xl text-lg text-gray-600 mb-10">
        Stop shipping air. Our AI-powered platform matches your shipments 
        with the best-fit trucks to reduce empty space, cut costs, and lower CO₂ emissions.
      </p>

      {/* Conditional "Get Started" Button */}
      <div className="flex gap-4 items-center">
        
        {/* OPTION A: If user is ALREADY logged in -> Go to Dashboard */}
        <SignedIn>
          <Link 
            href="/dashboard"
            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            Go to Dashboard
          </Link>
        </SignedIn>

        {/* OPTION B: If user is LOGGED OUT -> Open Sign Up */}
        <SignedOut>
          <SignUpButton mode="modal">
            <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200">
              Get Started Now
            </button>
          </SignUpButton>
        </SignedOut>

        <a 
          href="features"
          className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg border border-gray-200 hover:bg-gray-50 transition"
        >
          Learn More
        </a>
      </div>

      {/* Stats / Trust Badges */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center border-t pt-10 w-full max-w-4xl">
        <div>
          <h3 className="text-3xl font-bold text-gray-900">30%</h3>
          <p className="text-gray-500">Cost Savings</p>
        </div>
        <div>
          <h3 className="text-3xl font-bold text-gray-900">Real-time</h3>
          <p className="text-gray-500">Route Tracking</p>
        </div>
        <div>
          <h3 className="text-3xl font-bold text-gray-900">Green</h3>
          <p className="text-gray-500">CO₂ Reduction</p>
        </div>
      </div>

    </div>
  );
} 