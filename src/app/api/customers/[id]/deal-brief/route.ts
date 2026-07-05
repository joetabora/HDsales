import { NextResponse } from "next/server";
import { getCurrentUser, getDealershipId } from "@/lib/auth/session";
import { generateDealBrief, getLatestDealBrief } from "@/server/services/ai.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const brief = await getLatestDealBrief(id);
    return NextResponse.json(brief);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dealershipId = await getDealershipId();
    const user = await getCurrentUser();
    const brief = await generateDealBrief(id, user.id, dealershipId);
    return NextResponse.json(brief);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate brief";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
