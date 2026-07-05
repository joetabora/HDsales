import Link from "next/link";
import { ArrowLeft, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TradeEstimatorForm } from "@/features/inventory/components/trade-estimator-form";

export default function TradePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/inventory">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ArrowRightLeft className="h-6 w-6 text-forge-accent" />
            Trade Estimator
          </h1>
          <p className="text-forge-muted-foreground mt-1">
            Get an instant trade-in value estimate
          </p>
        </div>
      </div>

      <TradeEstimatorForm />
    </div>
  );
}
