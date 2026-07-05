import Link from "next/link";
import { AlertCircle, Bike, Cake, Shield, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { WalkUpCardData } from "@/server/services/walkup.service";

interface WalkUpCardProps {
  data: WalkUpCardData;
  customerId: string;
}

function FactRow({
  label,
  value,
  editAnchor,
}: {
  label: string;
  value: string | null | undefined;
  editAnchor?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-forge-muted">{label}</p>
        <p className="text-sm font-medium mt-0.5">{value}</p>
      </div>
      {editAnchor && (
        <Link href={`#${editAnchor}`} className="text-[10px] text-forge-accent hover:underline shrink-0">
          edit
        </Link>
      )}
    </div>
  );
}

export function WalkUpCard({ data, customerId }: WalkUpCardProps) {
  return (
    <Card className="relative overflow-hidden border-forge-accent/30">
      {/* Ember glow across the top edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-forge-accent/70 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,92,31,0.08),transparent_55%)]" />
      <CardHeader className="pb-3 relative">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-forge-accent/15 ring-1 ring-forge-accent/25">
              <Bike className="h-4.5 w-4.5 text-forge-accent" />
            </span>
            Walk-Up Card
          </CardTitle>
          {data.isStale && (
            <Badge variant="warning" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              {data.daysSinceContact} days since contact
            </Badge>
          )}
        </div>
        {data.lastContact && (
          <p className="text-sm text-forge-muted-foreground">{data.lastContact}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4 relative">
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          <FactRow label="Dream Bike" value={data.dreamBike} editAnchor="edit-customer" />
          <FactRow label="Trade / Current" value={data.tradeInfo} editAnchor="edit-customer" />
          <FactRow label="Budget" value={data.budgetTarget} />
          <FactRow label="Biggest Objection" value={data.biggestObjection} editAnchor="edit-customer" />
          {data.spouseName && (
            <FactRow
              label="Spouse"
              value={`${data.spouseName}${data.kidsInfo ? ` · ${data.kidsInfo}` : ""}`}
              editAnchor="edit-customer"
            />
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {data.isVeteran && (
            <Badge variant="secondary" className="gap-1">
              <Shield className="h-3 w-3" /> Veteran
            </Badge>
          )}
          {data.birthdaySoon && data.birthdayLabel && (
            <Badge variant="default" className="gap-1">
              <Cake className="h-3 w-3" /> {data.birthdayLabel}
            </Badge>
          )}
          {data.openDealStage && (
            <Badge variant="outline">Deal: {data.openDealStage.replace(/_/g, " ")}</Badge>
          )}
        </div>

        {data.matchingInventory.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-forge-muted mb-2">
              In Stock — Matches Interest
            </p>
            <div className="space-y-2">
              {data.matchingInventory.map((unit) => (
                <Link
                  key={unit.id}
                  href={`/inventory?search=${encodeURIComponent(unit.label)}`}
                  className="flex items-center justify-between rounded-lg border border-forge-border px-3 py-2 hover:bg-forge-surface-hover transition-colors"
                >
                  <span className="text-sm font-medium">
                    {unit.label}
                    {unit.color ? ` · ${unit.color}` : ""}
                  </span>
                  <span className="text-sm text-forge-accent">{formatCurrency(unit.price)}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {data.gaps.length > 0 && (
          <div className="rounded-lg border border-dashed border-forge-border p-3">
            <p className="text-xs text-forge-muted flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Missing info — capture on the floor:{" "}
              <span className="text-forge-foreground">{data.gaps.join(", ")}</span>
            </p>
            <Link
              href={`/customers/${customerId}#edit-customer`}
              className="text-xs text-forge-accent hover:underline mt-1 inline-block"
            >
              Update customer profile →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
