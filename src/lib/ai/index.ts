import { env } from "@/lib/env";
import { devProvider } from "./providers/dev";
import type { AIProvider } from "./types";

let providerInstance: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (providerInstance) return providerInstance;

  switch (env.AI_PROVIDER) {
    case "dev":
      providerInstance = devProvider;
      break;
    case "openai":
    case "anthropic":
    case "gemini":
    case "ollama":
      // Future providers — fall back to dev until API keys configured
      console.warn(`AI provider "${env.AI_PROVIDER}" not configured, using dev provider`);
      providerInstance = devProvider;
      break;
    default:
      providerInstance = devProvider;
  }

  return providerInstance;
}

export { devProvider } from "./providers/dev";
export type * from "./types";
