import Link from "next/link";
import { Calculator, Gauge, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export interface InventoryUnitItem {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  color: string | null;
  mileage: number | null;
  price: number;
  engine: string | null;
  status: string;
  stockNumber: string | null;
  hasAbs: boolean;
  hasNavigation: boolean;
  hasCruise: boolean;
  hasTourPack: boolean;
  description: string | null;
}

const STATUS_VARIANT: Record<string, "success" | "warning" | "secondary" | "destructive" | "default"> = {
  AVAILABLE: "success",
  PENDING: "warning",
  HOLD: "warning",
  SOLD: "secondary",
  INCOMING: "default",
};

export function InventoryGrid({ units }: { units: InventoryUnitItem[] }) {
  if (units.length === 0) {
    return (
      <div className="rounded-xl border border-forge-border bg-forge-surface/50 p-12 text-center">
        <Package className="h-12 w-12 text-forge-muted mx-auto mb-3" />
        <p className="text-lg font-medium">No units match your filters</p>
        <p className="text-sm text-forge-muted mt-1">Try adjusting your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {units.map((unit) => (
        <Card key={unit.id} className="overflow-hidden hover:border-forge-accent/30 transition-colors">
          <div className="h-32 bg-gradient-to-br from-forge-surface to-forge-background flex items-center justify-center border-b border-forge-border">
            <Package className="h-12 w-12 text-forge-muted/50" />
          </div>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base leading-snug">
                {unit.year} {unit.make} {unit.model}
              </CardTitle>
              <Badge variant={STATUS_VARIANT[unit.status] ?? "secondary"}>
                {unit.status.toLowerCase()}
              </Badge>
            </div>
            {unit.trim && (
              <p className="text-xs text-forge-muted">{unit.trim}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-forge-accent">
                {formatCurrency(unit.price)}
              </span>
              {unit.stockNumber && (
                <span className="text-xs text-forge-muted">#{unit.stockNumber}</span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 text-xs text-forge-muted">
              {unit.color && <span>{unit.color}</span>}
              {unit.mileage != null && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <Gauge className="h-3 w-3" />
                    {unit.mileage.toLocaleString()} mi
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-1">
              {unit.hasAbs && <Badge variant="outline">ABS</Badge>}
              {unit.hasNavigation && <Badge variant="outline">Nav</Badge>}
              {unit.hasCruise && <Badge variant="outline">Cruise</Badge>}
              {unit.hasTourPack && <Badge variant="outline">Tour-Pak</Badge>}
            </div>

            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href={`/inventory/calculator?price=${unit.price}&model=${encodeURIComponent(`${unit.year} ${unit.model}`)}`}>
                <Calculator className="h-3 w-3" />
                Payment Calculator
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
