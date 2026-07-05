import { NextResponse } from "next/server";
import { getCurrentUser, getDealershipId } from "@/lib/auth/session";
import {
  addInteraction,
  addNote,
  createCustomer,
} from "@/server/services/customer.service";
import { scheduleWalkInCadence } from "@/server/services/follow-up-cadence.service";
import { fullName } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const dealershipId = await getDealershipId();
    const user = await getCurrentUser();
    const body = await request.json();

    const customer = await createCustomer({
      dealershipId,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone || undefined,
      dreamBike: body.dreamBike || undefined,
      assignedToId: user.id,
    });

    if (body.note?.trim()) {
      await addNote(customer.id, user.id, body.note.trim());
    } else {
      await addInteraction(customer.id, user.id, {
        type: "WALK_IN",
        title: "Walk-in",
        description: "Quick capture on the floor",
      });
    }

    await scheduleWalkInCadence({
      dealershipId,
      customerId: customer.id,
      assignedToId: user.id,
      createdById: user.id,
      customerName: fullName(customer.firstName, customer.lastName),
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create customer";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
