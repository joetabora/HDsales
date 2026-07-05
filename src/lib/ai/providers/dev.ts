import { createHash } from "crypto";
import type { z } from "zod";
import type {
  AIProvider,
  ChatOptions,
  CustomerInsightInput,
  CustomerInsightOutput,
  DealBriefInput,
  DealBriefOutput,
  TranscriptionResult,
  VoiceExtractionOutput,
} from "../types";

function hashSeed(text: string): number {
  const hash = createHash("sha256").update(text).digest();
  return hash.readUInt32BE(0);
}

function deterministicEmbed(text: string, dimensions = 1536): number[] {
  const seed = hashSeed(text);
  const vector: number[] = [];
  for (let i = 0; i < dimensions; i++) {
    const val = Math.sin(seed * (i + 1) * 0.001) * 0.5 + 0.5;
    vector.push(val);
  }
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  return vector.map((v) => v / magnitude);
}

export class DevAIProvider implements AIProvider {
  name = "dev";

  async chat(options: ChatOptions): Promise<string> {
    const lastUser = [...options.messages].reverse().find((m) => m.role === "user");
    return `[Dev AI] Processed: ${lastUser?.content.slice(0, 200) ?? "empty request"}`;
  }

  async embed(text: string): Promise<number[]> {
    return deterministicEmbed(text);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.embed(t)));
  }

  async transcribe(_audioBuffer: Buffer, _mimeType: string): Promise<TranscriptionResult> {
    return {
      text: "Customer walked in interested in a Road Glide ST. Wife Sarah concerned about monthly payment around $550. Trades a 2021 Street Glide Special. Planning Sturgis trip in August.",
      durationSec: 45,
    };
  }

  async extractStructured<T>(prompt: string, schema: z.ZodType<T>): Promise<T> {
    if (prompt.includes("voice") || prompt.includes("transcript")) {
      return schema.parse({
        summary:
          "Customer interested in Road Glide ST. Payment concern from spouse. Trade-in available. Sturgis trip planned.",
        extractedFacts: {
          dreamBike: "Road Glide ST",
          spouseName: "Sarah",
          budgetTarget: "under $550/month",
          tradeBike: "2021 Street Glide Special",
          upcomingTrip: "Sturgis in August",
          biggestObjection: "monthly payment",
        },
        suggestedTasks: [
          { title: "Follow up on financing options", dueInDays: 1 },
          { title: "Send Sturgis event invite", dueInDays: 3 },
        ],
        followUpDraft:
          "Hey Mike! Hope Sturgis planning is going well. Great news — we just got a Road Glide ST in White Onyx Pearl with improved financing. Would love to get you and Sarah in to take another look!",
      } satisfies VoiceExtractionOutput);
    }
    throw new Error("Dev provider: unsupported extraction prompt");
  }

  generateDealBrief(input: DealBriefInput): DealBriefOutput {
    const keyFacts: string[] = [
      `Met ${input.daysSinceContact} days ago at ${input.lastContactContext}.`,
    ];
    if (input.dreamBike) keyFacts.push(`Loves the ${input.dreamBike}.`);
    if (input.spouseName && input.spouseConcern) {
      keyFacts.push(`Wife, ${input.spouseName}, ${input.spouseConcern}.`);
    }
    if (input.upcomingTrip) keyFacts.push(`Mentioned a trip to ${input.upcomingTrip}.`);

    const recommendedOpening = input.upcomingTrip
      ? `Ask how ${input.upcomingTrip.split(" ")[0]} planning is going, then show the newly arrived ${input.dreamBike ?? "bike"} with improved financing.`
      : `Reference your last conversation about the ${input.dreamBike ?? "bike"} and offer a fresh look at updated financing.`;

    return {
      headline: input.customerName,
      lastContact: `Met ${input.daysSinceContact} days ago at ${input.lastContactContext}.`,
      keyFacts,
      tradeInfo: input.tradeBike ? `Trades a ${input.tradeBike}.` : undefined,
      budgetTarget: input.budgetTarget,
      biggestObjection: input.biggestObjection,
      recommendedOpening,
      matchingInventory: input.matchingInventory ?? [],
    };
  }

  generateCustomerInsights(input: CustomerInsightInput): CustomerInsightOutput {
    return {
      conversationSummary: `${input.customerName} has shown strong interest in ${input.dreamBike ?? "upgrading their ride"}. ${input.spouseName ? `Spouse ${input.spouseName} is involved in the decision.` : ""} ${input.budgetTarget ? `Budget target: ${input.budgetTarget}.` : ""}`.trim(),
      buyingSignals: [
        input.dreamBike ? `Specific model interest: ${input.dreamBike}` : "General upgrade interest",
        input.currentBike ? `Current owner: ${input.currentBike}` : "First-time buyer potential",
        "Returned for follow-up visit",
      ].filter(Boolean),
      riskFactors: [
        input.budgetTarget ? "Payment sensitivity" : "Budget not yet confirmed",
        input.spouseName ? "Joint decision — spouse buy-in needed" : "Single decision maker",
      ],
      likelyObjections: [
        input.budgetTarget ? "Monthly payment too high" : "Price concerns",
        "Trade value expectations",
        "Timing — not ready yet",
      ],
      favoriteTopics: input.dreamBike
        ? [input.dreamBike, "Riding destinations", "Accessories"]
        : ["Motorcycles", "Events", "Riding"],
      suggestedOpener: input.dreamBike
        ? `How's the search for your ${input.dreamBike} going?`
        : `Great to see you again! What's been on your mind since we last talked?`,
      recommendedFollowUp: "Schedule demo ride with updated financing numbers",
      closeProbability: input.budgetTarget ? 0.62 : 0.45,
    };
  }
}

export const devProvider = new DevAIProvider();
