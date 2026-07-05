import type { z } from "zod";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface TranscriptionResult {
  text: string;
  durationSec?: number;
}

export interface AIProvider {
  name: string;
  chat(options: ChatOptions): Promise<string>;
  chatStream?(options: ChatOptions): AsyncIterable<string>;
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
  transcribe(audioBuffer: Buffer, mimeType: string): Promise<TranscriptionResult>;
  extractStructured<T>(prompt: string, schema: z.ZodType<T>): Promise<T>;
}

export interface DealBriefInput {
  customerName: string;
  daysSinceContact: number;
  lastContactContext: string;
  dreamBike?: string;
  spouseName?: string;
  spouseConcern?: string;
  tradeBike?: string;
  budgetTarget?: string;
  upcomingTrip?: string;
  biggestObjection?: string;
  matchingInventory?: Array<{ model: string; color: string; note: string }>;
  favoriteTopics?: string[];
}

export interface DealBriefOutput {
  headline: string;
  lastContact: string;
  keyFacts: string[];
  tradeInfo?: string;
  budgetTarget?: string;
  biggestObjection?: string;
  recommendedOpening: string;
  matchingInventory: Array<{ model: string; color: string; note: string }>;
}

export interface CustomerInsightInput {
  customerName: string;
  notes: string[];
  interactions: Array<{ type: string; title: string; description?: string }>;
  dreamBike?: string;
  currentBike?: string;
  spouseName?: string;
  budgetTarget?: string;
}

export interface CustomerInsightOutput {
  conversationSummary: string;
  buyingSignals: string[];
  riskFactors: string[];
  likelyObjections: string[];
  favoriteTopics: string[];
  suggestedOpener: string;
  recommendedFollowUp: string;
  closeProbability: number;
}

export interface VoiceExtractionOutput {
  summary: string;
  extractedFacts: Record<string, string>;
  suggestedTasks: Array<{ title: string; dueInDays: number }>;
  followUpDraft: string;
}
