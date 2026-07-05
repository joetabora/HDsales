import { NextResponse } from "next/server";
import { getDealershipId } from "@/lib/auth/session";
import { createTradeEstimate } from "@/server/services/inventory.service";

export async function POST(request: Request) {
  try {
    const dealershipId = await getDealershipId();
    const body = await request.json();

    const estimate = await createTradeEstimate({
      dealershipId,
      customerId: body.customerId,
      vin: body.vin,
      year: body.year ? Number(body.year) : undefined,
      make: body.make,
      model: body.model,
      mileage: body.mileage ? Number(body.mileage) : undefined,
      condition: body.condition,
      accessories: body.accessories,
    });

    return NextResponse.json({
      ...estimate,
      estimatedTrade: estimate.estimatedTrade ? Number(estimate.estimatedTrade) : null,
      marketValue: estimate.marketValue ? Number(estimate.marketValue) : null,
      auctionValue: estimate.auctionValue ? Number(estimate.auctionValue) : null,
      dealerEstimate: estimate.dealerEstimate ? Number(estimate.dealerEstimate) : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create trade estimate";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
