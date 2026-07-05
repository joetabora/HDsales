import db from "@/lib/db";
import { daysSince, formatCurrency, fullName } from "@/lib/utils";

export interface WalkUpCardData {
  customerName: string;
  lastContact: string | null;
  daysSinceContact: number | null;
  isStale: boolean;
  dreamBike: string | null;
  currentBike: string | null;
  tradeInfo: string | null;
  spouseName: string | null;
  kidsInfo: string | null;
  budgetTarget: string | null;
  biggestObjection: string | null;
  isVeteran: boolean;
  birthdaySoon: boolean;
  birthdayLabel: string | null;
  matchingInventory: Array<{
    id: string;
    label: string;
    color: string | null;
    price: number;
  }>;
  openDealStage: string | null;
  gaps: string[];
}

function daysUntilBirthday(birthday: Date): number {
  const today = new Date();
  const next = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export async function buildWalkUpCard(
  customerId: string,
  dealershipId: string
): Promise<WalkUpCardData | null> {
  const customer = await db.customer.findFirst({
    where: { id: customerId, dealershipId, deletedAt: null },
    include: {
      interactions: { where: { deletedAt: null }, orderBy: { occurredAt: "desc" }, take: 1 },
      deals: {
        where: { deletedAt: null, stage: { notIn: ["SOLD", "LOST", "ARCHIVED"] } },
        orderBy: { updatedAt: "desc" },
        take: 1,
      },
    },
  });

  if (!customer) return null;

  const lastInteraction = customer.interactions[0];
  const daysAgo = lastInteraction ? daysSince(lastInteraction.occurredAt) : null;
  const openDeal = customer.deals[0];

  const tradeInfo = customer.tradeInfo as Record<string, string> | null;
  const tradeLabel = tradeInfo?.bike
    ? `Trades a ${tradeInfo.bike}${tradeInfo.mileage ? ` (${tradeInfo.mileage} mi)` : ""}`
    : customer.currentBike
      ? `Currently rides ${customer.currentBike}`
      : null;

  let budgetTarget: string | null = null;
  if (openDeal?.monthlyTarget) {
    budgetTarget = `Target: under ${formatCurrency(Number(openDeal.monthlyTarget))}/month`;
  }

  const modelSearch = customer.dreamBike?.split(" ").slice(-2).join(" ") ?? "";
  const matchingInventory = modelSearch
    ? await db.inventoryUnit.findMany({
        where: {
          dealershipId,
          deletedAt: null,
          status: "AVAILABLE",
          model: { contains: modelSearch, mode: "insensitive" },
        },
        take: 3,
      })
    : [];

  const gaps: string[] = [];
  if (!customer.phone) gaps.push("phone");
  if (!customer.dreamBike) gaps.push("dream bike");
  if (!customer.spouseName && customer.kidsInfo) gaps.push("spouse name");
  if (!customer.creditConcerns) gaps.push("objections");
  if (!tradeLabel) gaps.push("current bike / trade");

  let birthdaySoon = false;
  let birthdayLabel: string | null = null;
  if (customer.birthday) {
    const days = daysUntilBirthday(customer.birthday);
    if (days <= 14) {
      birthdaySoon = true;
      birthdayLabel = days === 0 ? "Birthday today!" : `Birthday in ${days} days`;
    }
  }

  return {
    customerName: fullName(customer.firstName, customer.lastName),
    lastContact: lastInteraction
      ? `Met ${daysAgo} day${daysAgo === 1 ? "" : "s"} ago — ${lastInteraction.title}`
      : null,
    daysSinceContact: daysAgo,
    isStale: daysAgo !== null && daysAgo > 14,
    dreamBike: customer.dreamBike,
    currentBike: customer.currentBike,
    tradeInfo: tradeLabel,
    spouseName: customer.spouseName,
    kidsInfo: customer.kidsInfo,
    budgetTarget,
    biggestObjection: customer.creditConcerns,
    isVeteran: customer.isVeteran,
    birthdaySoon,
    birthdayLabel,
    matchingInventory: matchingInventory.map((u) => ({
      id: u.id,
      label: `${u.year} ${u.make} ${u.model}`,
      color: u.color,
      price: Number(u.price),
    })),
    openDealStage: openDeal?.stage ?? null,
    gaps,
  };
}
