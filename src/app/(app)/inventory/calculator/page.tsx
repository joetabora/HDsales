import Link from "next/link";
import { ArrowLeft, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentCalculator } from "@/features/inventory/components/payment-calculator";

interface CalculatorPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CalculatorPage({ searchParams }: CalculatorPageProps) {
  const params = await searchParams;
  const price = typeof params.price === "string" ? Number(params.price) : undefined;
  const model = typeof params.model === "string" ? params.model : undefined;
  const trade = typeof params.trade === "string" ? Number(params.trade) : undefined;

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
            <Calculator className="h-6 w-6 text-forge-accent" />
            Payment Calculator
          </h1>
          <p className="text-forge-muted-foreground mt-1">
            Build a financing quote for your customer
          </p>
        </div>
      </div>

      <PaymentCalculator
        initialPrice={price}
        initialModel={model}
        {...(trade ? { initialTrade: trade } : {})}
      />
    </div>
  );
}
