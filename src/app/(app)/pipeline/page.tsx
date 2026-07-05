import { Flame } from "lucide-react";
import { getDealershipId } from "@/lib/auth/session";
import { listDealsByStage } from "@/server/services/deal.service";
import { PipelineBoard } from "@/features/pipeline/components/pipeline-board";
import type { PipelineDeal } from "@/features/pipeline/components/pipeline-board";

function serializeDeal(deal: Awaited<ReturnType<typeof listDealsByStage>>[0]["deals"][0]): PipelineDeal {
  return {
    id: deal.id,
    title: deal.title,
    stage: deal.stage,
    amount: deal.amount ? Number(deal.amount) : null,
    monthlyTarget: deal.monthlyTarget ? Number(deal.monthlyTarget) : null,
    closeProbability: deal.closeProbability,
    customer: deal.customer,
    assignedTo: deal.assignedTo,
    inventoryUnit: deal.inventoryUnit
      ? { ...deal.inventoryUnit, price: Number(deal.inventoryUnit.price) }
      : null,
  };
}

export default async function PipelinePage() {
  const dealershipId = await getDealershipId();
  const pipeline = await listDealsByStage(dealershipId);

  const columns = pipeline.map((col) => ({
    stage: col.stage,
    deals: col.deals.map(serializeDeal),
  }));

  const totalDeals = columns.reduce((sum, c) => sum + c.deals.length, 0);
  const activeDeals = columns
    .filter((c) => !["SOLD", "LOST", "ARCHIVED"].includes(c.stage))
    .reduce((sum, c) => sum + c.deals.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Flame className="h-6 w-6 text-forge-accent" />
            Pipeline
          </h1>
          <p className="text-forge-muted-foreground mt-1">
            {activeDeals} active deals · {totalDeals} total
          </p>
        </div>
      </div>

      <PipelineBoard initialColumns={columns} />
    </div>
  );
}
