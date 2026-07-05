import { NextResponse } from "next/server";
import { getDealershipId } from "@/lib/auth/session";
import { listInventory } from "@/server/services/inventory.service";

export async function GET(request: Request) {
  try {
    const dealershipId = await getDealershipId();
    const { searchParams } = new URL(request.url);

    const units = await listInventory({
      dealershipId,
      search: searchParams.get("search") ?? undefined,
      year: searchParams.get("year") ? Number(searchParams.get("year")) : undefined,
      minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
      maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
      maxMileage: searchParams.get("maxMileage") ? Number(searchParams.get("maxMileage")) : undefined,
      make: searchParams.get("make") ?? undefined,
      model: searchParams.get("model") ?? undefined,
      color: searchParams.get("color") ?? undefined,
      hasAbs: searchParams.get("hasAbs") === "true" ? true : undefined,
      hasNavigation: searchParams.get("hasNavigation") === "true" ? true : undefined,
      hasCruise: searchParams.get("hasCruise") === "true" ? true : undefined,
      hasTourPack: searchParams.get("hasTourPack") === "true" ? true : undefined,
    });

    const serialized = units.map((u) => ({
      ...u,
      price: Number(u.price),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list inventory";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
