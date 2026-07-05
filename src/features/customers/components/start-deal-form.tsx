"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Handshake, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StartDealFormProps {
  customerId: string;
  customerName: string;
}

export function StartDealForm({ customerId, customerName }: StartDealFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [monthlyTarget, setMonthlyTarget] = useState("");
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          title: `${customerName} — New Deal`,
          monthlyTarget: monthlyTarget ? parseFloat(monthlyTarget) : undefined,
        }),
      });
      if (res.ok) {
        router.refresh();
        setOpen(false);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button variant="outline" className="w-full gap-2" onClick={() => setOpen(true)}>
        <Handshake className="h-4 w-4" />
        Start Deal
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Start Deal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="monthlyTarget">Monthly Payment Target ($)</Label>
            <Input
              id="monthlyTarget"
              type="number"
              placeholder="550"
              value={monthlyTarget}
              onChange={(e) => setMonthlyTarget(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Deal
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
