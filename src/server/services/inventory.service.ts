import db from "@/lib/db";
import type { InventoryStatus, Prisma } from "@prisma/client";

export interface InventoryFilters {
  dealershipId: string;
  search?: string;
  year?: number;
  minPrice?: number;
  maxPrice?: number;
  maxMileage?: number;
  make?: string;
  model?: string;
  color?: string;
  status?: InventoryStatus;
  hasAbs?: boolean;
  hasNavigation?: boolean;
  hasCruise?: boolean;
  hasTourPack?: boolean;
}

export async function listInventory(filters: InventoryFilters) {
  const where: Prisma.InventoryUnitWhereInput = {
    dealershipId: filters.dealershipId,
    deletedAt: null,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.year ? { year: filters.year } : {}),
    ...(filters.make ? { make: { equals: filters.make, mode: "insensitive" } } : {}),
    ...(filters.model ? { model: { contains: filters.model, mode: "insensitive" } } : {}),
    ...(filters.color ? { color: { contains: filters.color, mode: "insensitive" } } : {}),
    ...(filters.minPrice ? { price: { gte: filters.minPrice } } : {}),
    ...(filters.maxPrice ? { price: { lte: filters.maxPrice } } : {}),
    ...(filters.maxMileage ? { mileage: { lte: filters.maxMileage } } : {}),
    ...(filters.hasAbs !== undefined ? { hasAbs: filters.hasAbs } : {}),
    ...(filters.hasNavigation !== undefined ? { hasNavigation: filters.hasNavigation } : {}),
    ...(filters.hasCruise !== undefined ? { hasCruise: filters.hasCruise } : {}),
    ...(filters.hasTourPack !== undefined ? { hasTourPack: filters.hasTourPack } : {}),
    ...(filters.search
      ? {
          OR: [
            { vin: { contains: filters.search, mode: "insensitive" } },
            { model: { contains: filters.search, mode: "insensitive" } },
            { make: { contains: filters.search, mode: "insensitive" } },
            { stockNumber: { contains: filters.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  return db.inventoryUnit.findMany({
    where,
    orderBy: [{ status: "asc" }, { price: "asc" }],
  });
}

export async function recommendInventory(
  dealershipId: string,
  preferences: {
    dreamBike?: string;
    maxPrice?: number;
    color?: string;
  }
) {
  return db.inventoryUnit.findMany({
    where: {
      dealershipId,
      deletedAt: null,
      status: "AVAILABLE",
      ...(preferences.maxPrice ? { price: { lte: preferences.maxPrice } } : {}),
      ...(preferences.color ? { color: { contains: preferences.color, mode: "insensitive" } } : {}),
      ...(preferences.dreamBike
        ? { model: { contains: preferences.dreamBike.split(" ").pop(), mode: "insensitive" } }
        : {}),
    },
    take: 3,
  });
}

export async function createTradeEstimate(data: {
  dealershipId: string;
  customerId?: string;
  vin?: string;
  year?: number;
  make?: string;
  model?: string;
  mileage?: number;
  condition?: string;
  accessories?: string;
  photos?: string[];
}) {
  const baseValue = (data.year ?? 2020) * 100 + (data.mileage ?? 10000) * 0.1;
  const conditionMultiplier =
    data.condition === "excellent" ? 1.1 : data.condition === "good" ? 1.0 : 0.85;

  const estimatedTrade = Math.round(baseValue * conditionMultiplier * 0.65);
  const marketValue = Math.round(baseValue * conditionMultiplier * 0.85);
  const auctionValue = Math.round(baseValue * conditionMultiplier * 0.55);

  return db.tradeEstimate.create({
    data: {
      ...data,
      photos: data.photos ?? [],
      estimatedTrade,
      marketValue,
      auctionValue,
      dealerEstimate: estimatedTrade,
    },
  });
}
