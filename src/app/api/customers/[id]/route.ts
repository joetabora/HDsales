import { NextResponse } from "next/server";
import { getCurrentUser, getDealershipId } from "@/lib/auth/session";
import { updateCustomer } from "@/server/services/customer.service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dealershipId = await getDealershipId();
    const body = await request.json();

    const customer = await updateCustomer(id, dealershipId, {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email || null,
      phone: body.phone || null,
      dreamBike: body.dreamBike || null,
      currentBike: body.currentBike || null,
      spouseName: body.spouseName || null,
      kidsInfo: body.kidsInfo || null,
      creditConcerns: body.creditConcerns || null,
      occupation: body.occupation || null,
      referralSource: body.referralSource || null,
      favoriteLocations: body.favoriteLocations || null,
      isVeteran: Boolean(body.isVeteran),
    });

    return NextResponse.json(customer);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update customer";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
