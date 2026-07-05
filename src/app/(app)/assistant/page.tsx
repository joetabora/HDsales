import { Bot } from "lucide-react";
import { ChatInterface } from "@/features/assistant/components/chat-interface";

export default function AssistantPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Bot className="h-6 w-6 text-forge-accent" />
          AI Assistant
        </h1>
        <p className="text-forge-muted-foreground mt-1">
          Your AI-powered sales co-pilot
        </p>
      </div>

      <ChatInterface />
    </div>
  );
}
