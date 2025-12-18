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

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { shipmentId, truckId } = body;

    // 1. Update the Shipment
    // We link the truck and change status to ASSIGNED
    const updatedShipment = await db.shipment.update({
      where: { id: shipmentId },
      data: {
        assignedTruckId: truckId,
        status: "ASSIGNED",
      },
    });

    // 2. (Optional) Mark Truck as Unavailable
    // If you want to stop double-booking, you can set isAvailable = false
    await db.truck.update({
      where: { id: truckId },
      data: { isAvailable: false },
    });

    return NextResponse.json(updatedShipment);
  } catch (error) {
    console.log("[SHIPMENT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}