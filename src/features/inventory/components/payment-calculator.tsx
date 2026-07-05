"use client";

import { useState } from "react";
import { Calculator, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";

interface PaymentResult {
  monthlyPayment: number;
  totalCost: number;
  financedAmount: number;
}

interface PaymentCalculatorProps {
  initialPrice?: number;
  initialModel?: string;
  initialTrade?: number;
}

export function PaymentCalculator({ initialPrice, initialModel, initialTrade }: PaymentCalculatorProps) {
  const [bikePrice, setBikePrice] = useState(initialPrice?.toString() ?? "32999");
  const [tradeValue, setTradeValue] = useState(initialTrade?.toString() ?? "0");
  const [downPayment, setDownPayment] = useState("2000");
  const [apr, setApr] = useState("6.99");
  const [termMonths, setTermMonths] = useState("72");
  const [taxRate, setTaxRate] = useState("5.5");
  const [accessories, setAccessories] = useState("0");
  const [warranty, setWarranty] = useState("0");
  const [gap, setGap] = useState("0");
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function calculate() {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bikePrice: Number(bikePrice),
          tradeValue: Number(tradeValue),
          downPayment: Number(downPayment),
          apr: Number(apr),
          termMonths: Number(termMonths),
          taxRate: Number(taxRate),
          accessories: Number(accessories),
          warranty: Number(warranty),
          gap: Number(gap),
        }),
      });
      if (!res.ok) throw new Error("Calculation failed");
      setResult(await res.json());
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-forge-accent" />
            Payment Details
          </CardTitle>
          {initialModel && (
            <p className="text-sm text-forge-muted">{initialModel}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="bikePrice">Bike Price</Label>
              <Input id="bikePrice" type="number" value={bikePrice} onChange={(e) => setBikePrice(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tradeValue">Trade Value</Label>
              <Input id="tradeValue" type="number" value={tradeValue} onChange={(e) => setTradeValue(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="downPayment">Down Payment</Label>
              <Input id="downPayment" type="number" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apr">APR (%)</Label>
              <Input id="apr" type="number" step="0.01" value={apr} onChange={(e) => setApr(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="termMonths">Term (months)</Label>
              <Input id="termMonths" type="number" value={termMonths} onChange={(e) => setTermMonths(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input id="taxRate" type="number" step="0.1" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="accessories">Accessories</Label>
              <Input id="accessories" type="number" value={accessories} onChange={(e) => setAccessories(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="warranty">Warranty</Label>
              <Input id="warranty" type="number" value={warranty} onChange={(e) => setWarranty(e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="gap">GAP Insurance</Label>
              <Input id="gap" type="number" value={gap} onChange={(e) => setGap(e.target.value)} />
            </div>
          </div>

          <Button onClick={calculate} disabled={loading} className="w-full">
            {loading ? "Calculating…" : "Calculate Payment"}
          </Button>
        </CardContent>
      </Card>

      <Card id="payment-quote" className="print:border-none print:shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Quote Summary</CardTitle>
          {result && (
            <Button variant="outline" size="sm" onClick={handlePrint} className="print:hidden">
              <Printer className="h-4 w-4" />
              Print
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-6">
              <div className="text-center py-6 rounded-lg bg-forge-accent/10 border border-forge-accent/20">
                <p className="text-sm text-forge-muted-foreground">Estimated Monthly Payment</p>
                <p className="text-4xl font-bold text-forge-accent mt-1">
                  {formatCurrency(result.monthlyPayment)}
                </p>
                <p className="text-xs text-forge-muted mt-2">
                  {termMonths} months @ {apr}% APR
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-forge-muted">Financed Amount</span>
                  <span className="font-medium">{formatCurrency(result.financedAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-forge-muted">Total Cost</span>
                  <span className="font-medium">{formatCurrency(result.totalCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-forge-muted">Bike Price</span>
                  <span>{formatCurrency(Number(bikePrice))}</span>
                </div>
                {Number(tradeValue) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-forge-muted">Trade Credit</span>
                    <span className="text-emerald-400">-{formatCurrency(Number(tradeValue))}</span>
                  </div>
                )}
                {Number(downPayment) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-forge-muted">Down Payment</span>
                    <span className="text-emerald-400">-{formatCurrency(Number(downPayment))}</span>
                  </div>
                )}
              </div>

              <p className="text-[10px] text-forge-muted leading-relaxed print:text-black">
                * Estimated payment for illustration only. Actual terms subject to credit approval.
                Taxes, fees, and dealer charges may apply.
              </p>
            </div>
          ) : (
            <p className="text-sm text-forge-muted text-center py-12">
              Enter details and calculate to see your payment quote.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
