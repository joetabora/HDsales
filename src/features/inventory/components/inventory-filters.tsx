"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function InventoryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      startTransition(() => {
        router.push(`/inventory?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  function clearFilters() {
    startTransition(() => router.push("/inventory"));
  }

  const hasFilters = searchParams.toString().length > 0;

  return (
    <div className="rounded-2xl border border-forge-border card-sheen p-4 space-y-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 text-sm font-semibold sm:pointer-events-none"
        >
          <SlidersHorizontal className="h-4 w-4 text-forge-accent" />
          Filters
          <ChevronDown
            className={cn(
              "h-4 w-4 text-forge-muted transition-transform sm:hidden",
              expanded && "rotate-180"
            )}
          />
        </button>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} disabled={isPending}>
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div
        className={cn(
          "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
          !expanded && !hasFilters && "hidden sm:grid"
        )}
      >
        <div className="space-y-1.5">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-forge-muted" />
            <Input
              id="search"
              placeholder="VIN, model, stock #"
              className="pl-9"
              defaultValue={searchParams.get("search") ?? ""}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateParams({ search: (e.target as HTMLInputElement).value || null });
                }
              }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            placeholder="2025"
            defaultValue={searchParams.get("year") ?? ""}
            onChange={(e) => updateParams({ year: e.target.value || null })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            placeholder="Road Glide ST"
            defaultValue={searchParams.get("model") ?? ""}
            onChange={(e) => updateParams({ model: e.target.value || null })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            placeholder="Vivid Black"
            defaultValue={searchParams.get("color") ?? ""}
            onChange={(e) => updateParams({ color: e.target.value || null })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="minPrice">Min Price</Label>
          <Input
            id="minPrice"
            type="number"
            placeholder="15000"
            defaultValue={searchParams.get("minPrice") ?? ""}
            onChange={(e) => updateParams({ minPrice: e.target.value || null })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="maxPrice">Max Price</Label>
          <Input
            id="maxPrice"
            type="number"
            placeholder="35000"
            defaultValue={searchParams.get("maxPrice") ?? ""}
            onChange={(e) => updateParams({ maxPrice: e.target.value || null })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="maxMileage">Max Mileage</Label>
          <Input
            id="maxMileage"
            type="number"
            placeholder="5000"
            defaultValue={searchParams.get("maxMileage") ?? ""}
            onChange={(e) => updateParams({ maxMileage: e.target.value || null })}
          />
        </div>
      </div>

      <div
        className={cn(
          "flex flex-wrap gap-2 pt-1",
          !expanded && !hasFilters && "hidden sm:flex"
        )}
      >
        {(
          [
            ["hasAbs", "ABS"],
            ["hasNavigation", "Navigation"],
            ["hasCruise", "Cruise Control"],
            ["hasTourPack", "Tour-Pak"],
          ] as const
        ).map(([key, label]) => {
          const active = searchParams.get(key) === "true";
          return (
            <Button
              key={key}
              variant={active ? "default" : "outline"}
              size="sm"
              disabled={isPending}
              onClick={() => updateParams({ [key]: active ? null : "true" })}
            >
              {label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
