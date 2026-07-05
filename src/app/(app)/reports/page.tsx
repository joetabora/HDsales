import { BarChart3, Handshake, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getDealershipId } from "@/lib/auth/session";
import db from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

const STAGE_LABELS: Record<string, string> = {
  WALK_IN: "Walk-In",
  QUALIFIED: "Qualified",
  NEEDS_TRADE: "Needs Trade",
  FINANCING: "Financing",
  DEMO_RIDE: "Demo Ride",
  NEGOTIATING: "Negotiating",
  WAITING: "Waiting",
  SOLD: "Sold",
  LOST: "Lost",
  ARCHIVED: "Archived",
};

export default async function ReportsPage() {
  const dealershipId = await getDealershipId();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    soldThisMonth,
    totalCustomers,
    totalRevenue,
    dealsByStage,
    topSalespeople,
    inventoryAvailable,
  ] = await Promise.all([
    db.deal.count({
      where: { dealershipId, stage: "SOLD", closedAt: { gte: monthStart }, deletedAt: null },
    }),
    db.customer.count({ where: { dealershipId, deletedAt: null } }),
    db.deal.aggregate({
      where: { dealershipId, stage: "SOLD", closedAt: { gte: monthStart }, deletedAt: null },
      _sum: { amount: true },
    }),
    db.deal.groupBy({
      by: ["stage"],
      where: { dealershipId, deletedAt: null },
      _count: { id: true },
    }),
    db.deal.groupBy({
      by: ["assignedToId"],
      where: {
        dealershipId,
        stage: "SOLD",
        closedAt: { gte: monthStart },
        deletedAt: null,
        assignedToId: { not: null },
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    db.inventoryUnit.count({
      where: { dealershipId, status: "AVAILABLE", deletedAt: null },
    }),
  ]);

  const revenue = totalRevenue._sum.amount ? Number(totalRevenue._sum.amount) : 0;
  const closingRatio = totalCustomers > 0 ? Math.round((soldThisMonth / totalCustomers) * 1000) / 10 : 0;
  const maxStageCount = Math.max(...dealsByStage.map((d) => d._count.id), 1);

  const salespersonIds = topSalespeople.map((s) => s.assignedToId!).filter(Boolean);
  const salespeople = await db.user.findMany({
    where: { id: { in: salespersonIds } },
    select: { id: true, name: true },
  });
  const salespeopleMap = Object.fromEntries(salespeople.map((s) => [s.id, s.name]));

  const metrics = [
    { label: "Sold This Month", value: soldThisMonth.toString(), icon: Handshake },
    { label: "Revenue", value: formatCurrency(revenue), icon: TrendingUp },
    { label: "Closing Ratio", value: `${closingRatio}%`, icon: BarChart3 },
    { label: "Available Inventory", value: inventoryAvailable.toString(), icon: Users },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-forge-accent" />
          Sales Reports
        </h1>
        <p className="text-forge-muted-foreground mt-1">
          Performance dashboard for {now.toLocaleString("default", { month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-forge-border card-sheen p-4 lg:p-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] lg:text-xs font-medium text-forge-muted uppercase tracking-wide">
                {metric.label}
              </p>
              <metric.icon className="h-4 w-4 text-forge-muted" />
            </div>
            <p className="mt-2 text-xl lg:text-3xl font-bold stat-number truncate">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline by Stage</CardTitle>
            <CardDescription>Current deal distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dealsByStage
              .filter((d) => d._count.id > 0)
              .sort((a, b) => b._count.id - a._count.id)
              .map((stage) => (
                <div key={stage.stage} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span>{STAGE_LABELS[stage.stage] ?? stage.stage}</span>
                    <Badge variant="secondary">{stage._count.id}</Badge>
                  </div>
                  <Progress value={(stage._count.id / maxStageCount) * 100} />
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Salespeople</CardTitle>
            <CardDescription>Deals closed this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topSalespeople.length === 0 ? (
              <p className="text-sm text-forge-muted text-center py-4">No sales yet this month</p>
            ) : (
              topSalespeople.map((sp, i) => (
                <div
                  key={sp.assignedToId}
                  className="flex items-center justify-between rounded-lg border border-forge-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-forge-muted w-6">{i + 1}</span>
                    <span className="text-sm font-medium">
                      {salespeopleMap[sp.assignedToId!] ?? "Unknown"}
                    </span>
                  </div>
                  <Badge variant="success">{sp._count.id} deal{sp._count.id !== 1 ? "s" : ""}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
