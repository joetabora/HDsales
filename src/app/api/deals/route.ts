import { NextResponse } from "next/server";
import { getCurrentUser, getDealershipId } from "@/lib/auth/session";
import { createDeal } from "@/server/services/deal.service";

export async function POST(request: Request) {
  try {
    const dealershipId = await getDealershipId();
    const user = await getCurrentUser();
    const body = await request.json();

    if (!body.customerId || !body.title) {
      return NextResponse.json({ error: "customerId and title required" }, { status: 400 });
    }

    const deal = await createDeal({
      dealershipId,
      customerId: body.customerId,
      assignedToId: user.id,
      title: body.title,
      stage: body.stage ?? "WALK_IN",
      amount: body.amount,
      monthlyTarget: body.monthlyTarget,
    });

    return NextResponse.json(deal, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create deal";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
