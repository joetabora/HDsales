import { NextResponse } from "next/server";
import { getDealershipId } from "@/lib/auth/session";
import { globalSearch } from "@/server/services/customer.service";

export async function GET(request: Request) {
  try {
    const dealershipId = await getDealershipId();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? "";

    const results = await globalSearch(dealershipId, q);
    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
