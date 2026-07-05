import { describe, it, expect } from "vitest";
import { devProvider } from "@/lib/ai/providers/dev";

describe("DevAIProvider Deal Brief", () => {
  it("generates Mike Anderson style brief", () => {
    const brief = devProvider.generateDealBrief({
      customerName: "Mike Anderson",
      daysSinceContact: 42,
      lastContactContext: "Bike Night",
      dreamBike: "Road Glide ST in White Onyx Pearl",
      spouseName: "Sarah",
      spouseConcern: "wasn't convinced on the payment",
      tradeBike: "2021 Street Glide Special",
      budgetTarget: "under $550/month",
      upcomingTrip: "Sturgis in August",
      biggestObjection: "monthly payment",
      matchingInventory: [
        {
          model: "2025 Harley-Davidson Road Glide ST",
          color: "White Onyx Pearl",
          note: "Newly arrived with improved financing",
        },
      ],
    });

    expect(brief.headline).toBe("Mike Anderson");
    expect(brief.lastContact).toContain("42 days ago");
    expect(brief.lastContact).toContain("Bike Night");
    expect(brief.tradeInfo).toContain("Street Glide Special");
    expect(brief.budgetTarget).toBe("under $550/month");
    expect(brief.biggestObjection).toBe("monthly payment");
    expect(brief.recommendedOpening).toContain("Sturgis");
  });
});

describe("DevAIProvider Customer Insights", () => {
  it("generates customer insights", () => {
    const insights = devProvider.generateCustomerInsights({
      customerName: "Mike Anderson",
      notes: ["Interested in touring bikes"],
      interactions: [{ type: "WALK_IN", title: "Bike Night" }],
      dreamBike: "Road Glide ST",
      spouseName: "Sarah",
      budgetTarget: "under $550/month",
    });

    expect(insights.conversationSummary).toContain("Mike Anderson");
    expect(insights.buyingSignals.length).toBeGreaterThan(0);
    expect(insights.closeProbability).toBeGreaterThan(0);
  });
});
