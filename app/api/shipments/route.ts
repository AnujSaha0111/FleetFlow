import { db } from "../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, origin, destination, weight, volume } = body;
    
    // 1. Save the Shipment to DB
    const shipment = await db.shipment.create({
      data: {
        warehouseId: userId,
        origin,
        destination,
        totalWeight: parseFloat(weight),
        totalVolume: parseFloat(volume),
        status: "PENDING",
      },
    });

    // ======================================================
    // 🧠 THE OPTIMIZATION ENGINE STARTS HERE
    // ======================================================

    // 2. Fetch ALL available trucks from the fleet
    const allTrucks = await db.truck.findMany({
      where: { isAvailable: true },
      include: { dealer: true }, // Get dealer info (phone/email)
    });

    // 3. Filter & Rank Trucks (The Algorithm)
    const rankedTrucks = allTrucks
      .map((truck) => {
        // Step A: Feasibility Check (Hard Constraints)
        // Does the truck have enough space?
        const fitsWeight = truck.capacityWeight >= shipment.totalWeight;
        const fitsVolume = truck.capacityVolume >= shipment.totalVolume;

        if (!fitsWeight || !fitsVolume) return null; // Discard this truck

        // Step B: Utilization Calculation
        // How full will the truck be? (Higher is usually better for the truck owner)
        const utilization = (shipment.totalVolume / truck.capacityVolume) * 100;

        // Step C: Cost Calculation (Assuming 500km distance for estimation)
        // In a real app, we would use Google Maps API to get actual distance
        const estimatedDistance = 500; 
        const totalCost = estimatedDistance * truck.costPerKm;

        return {
          ...truck,
          matchDetails: {
            utilization: utilization.toFixed(1) + "%",
            estimatedCost: totalCost,
            score: totalCost, // Sort by LOWEST cost
          },
        };
      })
      .filter((item) => item !== null) // Remove the ones that didn't fit
      .sort((a, b) => a.matchDetails.score - b.matchDetails.score); // Sort: Cheapest first

    // 4. Return the shipment ID AND the best trucks
    return NextResponse.json({ 
      shipmentId: shipment.id,
      matches: rankedTrucks 
    });

  } catch (error) {
    console.log("[SHIPMENT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// ... existing POST code above ...

// ... imports and POST method remain the same ...

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { shipmentId, truckId, status } = body;

    // SCENARIO 1: BOOKING (Existing logic)
    if (truckId && !status) {
      const updatedShipment = await db.shipment.update({
        where: { id: shipmentId },
        data: {
          assignedTruckId: truckId,
          status: "ASSIGNED",
        },
      });
      // Mark truck as busy
      await db.truck.update({
        where: { id: truckId },
        data: { isAvailable: false },
      });
      return NextResponse.json(updatedShipment);
    }

    // SCENARIO 2: STATUS UPDATE (New Logic for Tracking)
    if (status) {
      let updateData: any = { status };

      // If completing the trip, calculate final stats
      if (status === "DELIVERED") {
        // 1. Fetch shipment to get distance/weight details
        const shipment = await db.shipment.findUnique({
          where: { id: shipmentId },
          include: { assignedTruck: true }
        });

        if (shipment && shipment.assignedTruck) {
           // --- THE MATH ---
           // Assume standard market rate is ₹8/km/kg. We optimized it.
           const distance = 500; // Hardcoded for demo, or use shipment.distance
           
           // Actual Cost
           const actualCost = distance * shipment.assignedTruck.costPerKm;
           
           // Market Cost (Higher)
           const marketCost = actualCost * 1.3; // We assume we saved them 30%
           const savings = marketCost - actualCost;

           // CO2 Calculation (Standard: 2.68kg CO2 per liter diesel)
           // Formula: (Distance / FuelEfficiency) * 2.68
           const fuelUsed = distance / shipment.assignedTruck.fuelEfficiency;
           const co2Emitted = fuelUsed * 2.68;
           const co2Saved = co2Emitted * 0.2; // Assume we saved 20% vs empty running

           updateData = {
             status: "DELIVERED",
             estimatedCost: actualCost,
             co2Saved: parseFloat(co2Saved.toFixed(2)),
             requiredBy: new Date(), // Set delivery time
           };

           // Free up the truck again
           await db.truck.update({
             where: { id: shipment.assignedTruckId! },
             data: { isAvailable: true }
           });
        }
      }

      const updatedShipment = await db.shipment.update({
        where: { id: shipmentId },
        data: updateData,
      });

      return NextResponse.json(updatedShipment);
    }

    return new NextResponse("Invalid Request", { status: 400 });

  } catch (error) {
    console.log("[SHIPMENT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}