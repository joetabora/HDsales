"use client";

import { useState } from "react";
import { ArrowRightLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";

interface TradeResult {
  id: string;
  estimatedTrade: number | null;
  marketValue: number | null;
  auctionValue: number | null;
  dealerEstimate: number | null;
}

export function TradeEstimatorForm() {
  const [vin, setVin] = useState("");
  const [year, setYear] = useState("");
  const [make, setMake] = useState("Harley-Davidson");
  const [model, setModel] = useState("");
  const [mileage, setMileage] = useState("");
  const [condition, setCondition] = useState("good");
  const [accessories, setAccessories] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TradeResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/inventory/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vin: vin || undefined,
          year: year ? Number(year) : undefined,
          make,
          model,
          mileage: mileage ? Number(mileage) : undefined,
          condition,
          accessories: accessories || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setResult(await res.json());
    } catch {
      // error silently — user can retry
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-forge-accent" />
            Trade-In Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="vin">VIN</Label>
                <Input id="vin" placeholder="1HD1..." value={vin} onChange={(e) => setVin(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="year">Year</Label>
                <Input id="year" type="number" placeholder="2021" value={year} onChange={(e) => setYear(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="make">Make</Label>
                <Input id="make" value={make} onChange={(e) => setMake(e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="model">Model</Label>
                <Input id="model" placeholder="Street Glide Special" value={model} onChange={(e) => setModel(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mileage">Mileage</Label>
                <Input id="mileage" type="number" placeholder="8500" value={mileage} onChange={(e) => setMileage(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="condition">Condition</Label>
                <select
                  id="condition"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-forge-border bg-forge-surface px-3 py-2 text-sm"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="accessories">Accessories / Upgrades</Label>
                <Textarea
                  id="accessories"
                  placeholder="Stage II kit, windscreen, saddlebags..."
                  value={accessories}
                  onChange={(e) => setAccessories(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Estimating…
                </>
              ) : (
                "Get Trade Estimate"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estimate Results</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-4">
              <div className="text-center py-6 rounded-lg bg-forge-accent/10 border border-forge-accent/20">
                <p className="text-sm text-forge-muted-foreground">Estimated Trade Value</p>
                <p className="text-4xl font-bold text-forge-accent mt-1">
                  {formatCurrency(result.estimatedTrade ?? 0)}
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-forge-border">
                  <span className="text-forge-muted">Market Value</span>
                  <span className="font-medium">{formatCurrency(result.marketValue ?? 0)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-forge-border">
                  <span className="text-forge-muted">Auction Value</span>
                  <span className="font-medium">{formatCurrency(result.auctionValue ?? 0)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-forge-muted">Dealer Estimate</span>
                  <span className="font-medium">{formatCurrency(result.dealerEstimate ?? 0)}</span>
                </div>
              </div>

              <p className="text-xs text-forge-muted leading-relaxed">
                Estimate valid for 7 days. Final value subject to physical inspection and VIN verification.
              </p>

              <Button variant="outline" className="w-full" asChild>
                <a href={`/inventory/calculator?trade=${result.estimatedTrade ?? 0}`}>
                  Use in Payment Calculator
                </a>
              </Button>
            </div>
          ) : (
            <p className="text-sm text-forge-muted text-center py-12">
              Enter your trade-in details to receive an instant estimate.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
