import db from "@/lib/db";
import { devProvider } from "@/lib/ai/providers/dev";
import { daysSince, fullName } from "@/lib/utils";
import type { DealBriefOutput } from "@/lib/ai/types";
import type { Prisma } from "@prisma/client";

export async function generateDealBrief(
  customerId: string,
  userId: string,
  dealershipId: string
): Promise<DealBriefOutput & { id: string }> {
  const customer = await db.customer.findFirst({
    where: { id: customerId, dealershipId, deletedAt: null },
    include: {
      interactions: { orderBy: { occurredAt: "desc" }, take: 5 },
      deals: { where: { deletedAt: null }, orderBy: { updatedAt: "desc" }, take: 1 },
      aiInsights: true,
    },
  });

  if (!customer) throw new Error("Customer not found");

  const lastInteraction = customer.interactions[0];
  const daysAgo = lastInteraction ? daysSince(lastInteraction.occurredAt) : 0;
  const lastContext =
    lastInteraction?.title ?? "initial walk-in";

  const matchingInventory = await db.inventoryUnit.findMany({
    where: {
      dealershipId,
      deletedAt: null,
      status: "AVAILABLE",
      ...(customer.dreamBike
        ? { model: { contains: customer.dreamBike.split(" ").slice(-2).join(" "), mode: "insensitive" } }
        : {}),
    },
    take: 2,
  });

  const tradeInfo = customer.tradeInfo as Record<string, string> | null;
  const brief = devProvider.generateDealBrief({
    customerName: fullName(customer.firstName, customer.lastName),
    daysSinceContact: daysAgo,
    lastContactContext: lastContext,
    dreamBike: customer.dreamBike ?? undefined,
    spouseName: customer.spouseName ?? undefined,
    spouseConcern: customer.aiInsights?.likelyObjections
      ? (customer.aiInsights.likelyObjections as string[])[0]
      : customer.creditConcerns ?? "wasn't convinced on the payment",
    tradeBike: tradeInfo?.bike ?? customer.currentBike ?? undefined,
    budgetTarget: customer.aiInsights?.recommendedFollowUp?.includes("$")
      ? customer.aiInsights.recommendedFollowUp
      : "under $550/month",
    upcomingTrip: "Sturgis in August",
    biggestObjection: customer.creditConcerns ?? "monthly payment",
    matchingInventory: matchingInventory.map((u) => ({
      model: `${u.year} ${u.make} ${u.model}`,
      color: u.color ?? "Unknown",
      note: "Newly arrived with improved financing",
    })),
  });

  const saved = await db.dealBrief.create({
    data: {
      customerId,
      generatedById: userId,
      headline: brief.headline,
      lastContact: brief.lastContact,
      keyFacts: brief.keyFacts,
      tradeInfo: brief.tradeInfo,
      budgetTarget: brief.budgetTarget,
      biggestObjection: brief.biggestObjection,
      recommendedOpening: brief.recommendedOpening,
      matchingInventory: brief.matchingInventory,
      rawContent: brief as unknown as Prisma.InputJsonValue,
    },
  });

  return { ...brief, id: saved.id };
}

export async function generateCustomerInsights(
  customerId: string,
  dealershipId: string
) {
  const customer = await db.customer.findFirst({
    where: { id: customerId, dealershipId },
    include: {
      notes: { where: { deletedAt: null }, take: 10, orderBy: { createdAt: "desc" } },
      interactions: { take: 10, orderBy: { occurredAt: "desc" } },
    },
  });

  if (!customer) throw new Error("Customer not found");

  const insights = devProvider.generateCustomerInsights({
    customerName: fullName(customer.firstName, customer.lastName),
    notes: customer.notes.map((n) => n.content),
    interactions: customer.interactions.map((i) => ({
      type: i.type,
      title: i.title,
      description: i.description ?? undefined,
    })),
    dreamBike: customer.dreamBike ?? undefined,
    currentBike: customer.currentBike ?? undefined,
    spouseName: customer.spouseName ?? undefined,
    budgetTarget: "under $550/month",
  });

  const saved = await db.customerAiInsight.upsert({
    where: { customerId },
    create: {
      customerId,
      conversationSummary: insights.conversationSummary,
      buyingSignals: insights.buyingSignals,
      riskFactors: insights.riskFactors,
      likelyObjections: insights.likelyObjections,
      favoriteTopics: insights.favoriteTopics,
      suggestedOpener: insights.suggestedOpener,
      recommendedFollowUp: insights.recommendedFollowUp,
      closeProbability: insights.closeProbability,
    },
    update: {
      conversationSummary: insights.conversationSummary,
      buyingSignals: insights.buyingSignals,
      riskFactors: insights.riskFactors,
      likelyObjections: insights.likelyObjections,
      favoriteTopics: insights.favoriteTopics,
      suggestedOpener: insights.suggestedOpener,
      recommendedFollowUp: insights.recommendedFollowUp,
      closeProbability: insights.closeProbability,
    },
  });

  await db.customer.update({
    where: { id: customerId },
    data: { aiSummary: insights.conversationSummary },
  });

  return saved;
}

export async function getLatestDealBrief(customerId: string) {
  return db.dealBrief.findFirst({
    where: { customerId },
    orderBy: { createdAt: "desc" },
  });
}
