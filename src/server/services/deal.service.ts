import db from "@/lib/db";
import { calculatePayment } from "@/lib/calculators/payment";
import type { DealStage, Prisma } from "@prisma/client";

export async function listDealsByStage(dealershipId: string) {
  const deals = await db.deal.findMany({
    where: { dealershipId, deletedAt: null },
    include: {
      customer: {
        select: { id: true, firstName: true, lastName: true, phone: true, dreamBike: true },
      },
      assignedTo: { select: { id: true, name: true, image: true } },
      inventoryUnit: {
        select: { id: true, year: true, make: true, model: true, color: true, price: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const stages: DealStage[] = [
    "WALK_IN",
    "QUALIFIED",
    "NEEDS_TRADE",
    "FINANCING",
    "DEMO_RIDE",
    "NEGOTIATING",
    "WAITING",
    "SOLD",
    "LOST",
    "ARCHIVED",
  ];

  return stages.map((stage) => ({
    stage,
    deals: deals.filter((d) => d.stage === stage),
  }));
}

export async function updateDealStage(
  dealId: string,
  dealershipId: string,
  stage: DealStage
) {
  return db.deal.update({
    where: { id: dealId, dealershipId },
    data: {
      stage,
      ...(stage === "SOLD" ? { closedAt: new Date() } : {}),
    },
  });
}

export async function createDeal(data: {
  dealershipId: string;
  customerId: string;
  assignedToId?: string;
  title: string;
  stage?: DealStage;
  amount?: number;
  monthlyTarget?: number;
}) {
  return db.deal.create({
    data: {
      dealershipId: data.dealershipId,
      customerId: data.customerId,
      assignedToId: data.assignedToId,
      title: data.title,
      stage: data.stage ?? "WALK_IN",
      amount: data.amount,
      monthlyTarget: data.monthlyTarget,
    },
  });
}

export async function savePaymentQuote(
  dealershipId: string,
  customerId: string | undefined,
  input: Parameters<typeof calculatePayment>[0]
) {
  const result = calculatePayment(input);
  return db.paymentQuote.create({
    data: {
      dealershipId,
      customerId,
      bikePrice: input.bikePrice,
      tradeValue: input.tradeValue ?? 0,
      downPayment: input.downPayment ?? 0,
      apr: input.apr,
      termMonths: input.termMonths,
      taxRate: input.taxRate ?? 0,
      accessories: input.accessories ?? 0,
      warranty: input.warranty ?? 0,
      gap: input.gap ?? 0,
      monthlyPayment: result.monthlyPayment,
      totalCost: result.totalCost,
    },
  });
}
