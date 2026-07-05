import { NextResponse } from "next/server";
import { getDealershipId, getCurrentUser } from "@/lib/auth/session";
import { createCustomer } from "@/server/services/customer.service";

export async function POST(request: Request) {
  try {
    const dealershipId = await getDealershipId();
    const user = await getCurrentUser();
    const body = await request.json();

    const customer = await createCustomer({
      dealershipId,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email || undefined,
      phone: body.phone || undefined,
      dreamBike: body.dreamBike || undefined,
      currentBike: body.currentBike || undefined,
      assignedToId: user.id,
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create customer";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
