import { NextResponse } from "next/server";
import { getDealershipId } from "@/lib/auth/session";
import { generateCustomerInsights } from "@/server/services/ai.service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dealershipId = await getDealershipId();
    const insights = await generateCustomerInsights(id, dealershipId);
    return NextResponse.json(insights);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate insights";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
