import Link from "next/link";
import { Suspense } from "react";
import { ArrowRightLeft, Calculator, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDealershipId } from "@/lib/auth/session";
import { listInventory } from "@/server/services/inventory.service";
import { InventoryFilters } from "@/features/inventory/components/inventory-filters";
import { InventoryGrid } from "@/features/inventory/components/inventory-grid";
import type { InventoryUnitItem } from "@/features/inventory/components/inventory-grid";

interface InventoryPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const params = await searchParams;
  const dealershipId = await getDealershipId();

  const getParam = (key: string) => {
    const val = params[key];
    return typeof val === "string" ? val : undefined;
  };

  const units = await listInventory({
    dealershipId,
    search: getParam("search"),
    year: getParam("year") ? Number(getParam("year")) : undefined,
    minPrice: getParam("minPrice") ? Number(getParam("minPrice")) : undefined,
    maxPrice: getParam("maxPrice") ? Number(getParam("maxPrice")) : undefined,
    maxMileage: getParam("maxMileage") ? Number(getParam("maxMileage")) : undefined,
    model: getParam("model"),
    color: getParam("color"),
    hasAbs: getParam("hasAbs") === "true" ? true : undefined,
    hasNavigation: getParam("hasNavigation") === "true" ? true : undefined,
    hasCruise: getParam("hasCruise") === "true" ? true : undefined,
    hasTourPack: getParam("hasTourPack") === "true" ? true : undefined,
  });

  const serialized: InventoryUnitItem[] = units.map((u) => ({
    id: u.id,
    year: u.year,
    make: u.make,
    model: u.model,
    trim: u.trim,
    color: u.color,
    mileage: u.mileage,
    price: Number(u.price),
    engine: u.engine,
    status: u.status,
    stockNumber: u.stockNumber,
    hasAbs: u.hasAbs,
    hasNavigation: u.hasNavigation,
    hasCruise: u.hasCruise,
    hasTourPack: u.hasTourPack,
    description: u.description,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6 text-forge-accent" />
            Inventory
          </h1>
          <p className="text-forge-muted-foreground mt-1">
            {serialized.length} unit{serialized.length !== 1 ? "s" : ""} available
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/inventory/calculator">
              <Calculator className="h-4 w-4" />
              Calculator
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/inventory/trade">
              <ArrowRightLeft className="h-4 w-4" />
              Trade Estimator
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-forge-surface" />}>
        <InventoryFilters />
      </Suspense>

      <InventoryGrid units={serialized} />
    </div>
  );
}
