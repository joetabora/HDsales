import { NextResponse } from "next/server";
import type { DealStage } from "@prisma/client";
import { getDealershipId } from "@/lib/auth/session";
import { updateDealStage } from "@/server/services/deal.service";

const VALID_STAGES: DealStage[] = [
  "WALK_IN",
  "QUALIFIED",
  "NEEDS_TRADE",
  "FINANCING",
  "DEMO_RIDE",
  "NEGOTIATING",
  "WAITING",
  "SOLD",
  "LOST",
  "ARCHIVED",
];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dealershipId = await getDealershipId();
    const body = await request.json();
    const stage = body.stage as DealStage;

    if (!VALID_STAGES.includes(stage)) {
      return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
    }

    const deal = await updateDealStage(id, dealershipId, stage);
    return NextResponse.json(deal);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update stage";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
