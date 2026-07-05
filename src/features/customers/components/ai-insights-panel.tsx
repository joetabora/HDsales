"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Loader2, RefreshCw, Sparkles, TrendingUp, AlertTriangle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface AiInsightsPanelProps {
  customerId: string;
  insights?: {
    conversationSummary: string | null;
    buyingSignals: unknown;
    riskFactors: unknown;
    likelyObjections: unknown;
    favoriteTopics: unknown;
    suggestedOpener: string | null;
    recommendedFollowUp: string | null;
    closeProbability: number | null;
  } | null;
}

export function AiInsightsPanel({ customerId, insights: initialInsights }: AiInsightsPanelProps) {
  const [insights, setInsights] = useState(initialInsights);
  const [loading, setLoading] = useState(false);

  async function generateInsights() {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${customerId}/insights`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setInsights(data);
      }
    } finally {
      setLoading(false);
    }
  }

  const buyingSignals = (insights?.buyingSignals as string[]) ?? [];
  const riskFactors = (insights?.riskFactors as string[]) ?? [];
  const likelyObjections = (insights?.likelyObjections as string[]) ?? [];
  const favoriteTopics = (insights?.favoriteTopics as string[]) ?? [];
  const closeProb = insights?.closeProbability ?? 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-forge-accent" />
            AI Insights
          </CardTitle>
          <Button size="sm" variant="outline" onClick={generateInsights} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {insights ? "Refresh" : "Generate"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!insights ? (
          <div className="text-center py-8">
            <Sparkles className="h-10 w-10 text-forge-muted mx-auto mb-3" />
            <p className="text-sm text-forge-muted-foreground">
              Generate AI insights from customer history
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            {insights.conversationSummary && (
              <p className="text-sm text-forge-muted-foreground leading-relaxed">
                {insights.conversationSummary}
              </p>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-forge-muted flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Close Probability
                </span>
                <span className="text-sm font-bold text-forge-accent">
                  {Math.round(closeProb * 100)}%
                </span>
              </div>
              <Progress value={closeProb * 100} className="h-2" />
            </div>

            {buyingSignals.length > 0 && (
              <InsightSection title="Buying Signals" items={buyingSignals} variant="success" />
            )}

            {riskFactors.length > 0 && (
              <InsightSection
                title="Risk Factors"
                items={riskFactors}
                variant="warning"
                icon={AlertTriangle}
              />
            )}

            {likelyObjections.length > 0 && (
              <InsightSection title="Likely Objections" items={likelyObjections} variant="destructive" />
            )}

            {favoriteTopics.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-forge-muted mb-2">
                  Favorite Topics
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {favoriteTopics.map((topic, i) => (
                    <Badge key={i} variant="secondary">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {insights.suggestedOpener && (
              <div className="rounded-lg border border-forge-accent/20 bg-forge-accent/5 p-3">
                <div className="flex items-center gap-2 text-forge-accent mb-1">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Suggested Opener
                  </span>
                </div>
                <p className="text-sm italic">&ldquo;{insights.suggestedOpener}&rdquo;</p>
              </div>
            )}

            {insights.recommendedFollowUp && (
              <div className="rounded-lg border border-forge-border bg-forge-background p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-forge-muted mb-1">
                  Recommended Follow-up
                </p>
                <p className="text-sm">{insights.recommendedFollowUp}</p>
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

function InsightSection({
  title,
  items,
  variant,
  icon: Icon,
}: {
  title: string;
  items: string[];
  variant: "success" | "warning" | "destructive";
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-forge-muted mb-2 flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {title}
      </p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Badge variant={variant} className="mt-0.5 shrink-0 text-[10px]">
              {i + 1}
            </Badge>
            <span className="text-forge-muted-foreground">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
