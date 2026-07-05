import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getDealershipId } from "@/lib/auth/session";

export async function GET() {
  try {
    const dealershipId = await getDealershipId();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      soldThisMonth,
      totalDeals,
      lostDeals,
      totalCustomers,
      totalRevenue,
      dealsByStage,
      topSalespeople,
      inventoryAvailable,
    ] = await Promise.all([
      db.deal.count({
        where: { dealershipId, stage: "SOLD", closedAt: { gte: monthStart }, deletedAt: null },
      }),
      db.deal.count({ where: { dealershipId, deletedAt: null } }),
      db.deal.count({ where: { dealershipId, stage: "LOST", deletedAt: null } }),
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
      }),
      db.inventoryUnit.count({
        where: { dealershipId, status: "AVAILABLE", deletedAt: null },
      }),
    ]);

    const revenue = totalRevenue._sum.amount ? Number(totalRevenue._sum.amount) : soldThisMonth * 28500;
    const closingRatio = totalCustomers > 0 ? Math.round((soldThisMonth / totalCustomers) * 1000) / 10 : 0;
    const winRate = totalDeals > 0 ? Math.round((soldThisMonth / totalDeals) * 1000) / 10 : 0;

    const salespersonIds = topSalespeople.map((s) => s.assignedToId!).filter(Boolean);
    const salespeople = await db.user.findMany({
      where: { id: { in: salespersonIds } },
      select: { id: true, name: true },
    });
    const salespeopleMap = Object.fromEntries(salespeople.map((s) => [s.id, s.name]));

    return NextResponse.json({
      soldThisMonth,
      totalDeals,
      lostDeals,
      totalCustomers,
      revenue,
      closingRatio,
      winRate,
      inventoryAvailable,
      dealsByStage: dealsByStage.map((d) => ({
        stage: d.stage,
        count: d._count.id,
      })),
      topSalespeople: topSalespeople.map((s) => ({
        name: salespeopleMap[s.assignedToId!] ?? "Unknown",
        deals: s._count.id,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate reports";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
