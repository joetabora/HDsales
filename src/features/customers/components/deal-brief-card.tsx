"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, Target, Bike, DollarSign, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DealBriefOutput } from "@/lib/ai/types";

interface DealBriefCardProps {
  customerId: string;
  customerName: string;
  initialBrief?: {
    headline: string;
    lastContact: string | null;
    keyFacts: unknown;
    tradeInfo: string | null;
    budgetTarget: string | null;
    biggestObjection: string | null;
    recommendedOpening: string | null;
    matchingInventory: unknown;
  } | null;
}

export function DealBriefCard({ customerId, customerName, initialBrief }: DealBriefCardProps) {
  const [brief, setBrief] = useState<DealBriefOutput | null>(
    initialBrief
      ? {
          headline: initialBrief.headline,
          lastContact: initialBrief.lastContact ?? "",
          keyFacts: (initialBrief.keyFacts as string[]) ?? [],
          tradeInfo: initialBrief.tradeInfo ?? undefined,
          budgetTarget: initialBrief.budgetTarget ?? undefined,
          biggestObjection: initialBrief.biggestObjection ?? undefined,
          recommendedOpening: initialBrief.recommendedOpening ?? "",
          matchingInventory:
            (initialBrief.matchingInventory as DealBriefOutput["matchingInventory"]) ?? [],
        }
      : null
  );
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(!!initialBrief);

  async function generateBrief() {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${customerId}/deal-brief`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setBrief(data);
        setExpanded(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden border-forge-accent/20">
      <CardHeader className="bg-gradient-to-r from-forge-accent/10 to-transparent">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-forge-accent" />
            Deal Brief
          </CardTitle>
          <Button
            size="sm"
            onClick={generateBrief}
            disabled={loading}
            className="shadow-lg shadow-forge-accent/20"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {brief ? "Refresh Brief" : "Generate Brief"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AnimatePresence mode="wait">
          {!brief && !loading ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <Target className="h-10 w-10 text-forge-muted mx-auto mb-3" />
              <p className="text-sm text-forge-muted-foreground">
                Generate a Mike Anderson-style deal brief for {customerName}
              </p>
            </motion.div>
          ) : brief ? (
            <motion.div
              key="brief"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div>
                <h3 className="text-xl font-bold text-forge-foreground">{brief.headline}</h3>
                <p className="text-sm text-forge-muted-foreground mt-1">{brief.lastContact}</p>
              </div>

              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-5"
                >
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-widest text-forge-accent mb-2">
                      Key Facts
                    </h4>
                    <ul className="space-y-2">
                      {brief.keyFacts.map((fact, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-forge-foreground"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-forge-accent shrink-0" />
                          {fact}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {brief.tradeInfo && (
                      <div className="rounded-lg border border-forge-border bg-forge-background p-3">
                        <div className="flex items-center gap-2 text-forge-accent mb-1">
                          <Bike className="h-4 w-4" />
                          <span className="text-xs font-semibold uppercase tracking-wider">Trade</span>
                        </div>
                        <p className="text-sm">{brief.tradeInfo}</p>
                      </div>
                    )}
                    {brief.budgetTarget && (
                      <div className="rounded-lg border border-forge-border bg-forge-background p-3">
                        <div className="flex items-center gap-2 text-emerald-400 mb-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-xs font-semibold uppercase tracking-wider">Budget</span>
                        </div>
                        <p className="text-sm">{brief.budgetTarget}</p>
                      </div>
                    )}
                  </div>

                  {brief.biggestObjection && (
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                      <Badge variant="warning" className="mb-2">Objection</Badge>
                      <p className="text-sm">{brief.biggestObjection}</p>
                    </div>
                  )}

                  <div className="rounded-lg border border-forge-accent/30 bg-forge-accent/5 p-4">
                    <div className="flex items-center gap-2 text-forge-accent mb-2">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        Recommended Opening
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed italic">&ldquo;{brief.recommendedOpening}&rdquo;</p>
                  </div>

                  {brief.matchingInventory.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-widest text-forge-muted mb-2">
                        Matching Inventory
                      </h4>
                      <div className="space-y-2">
                        {brief.matchingInventory.map((unit, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between rounded-lg border border-forge-border p-3"
                          >
                            <div>
                              <p className="text-sm font-medium">{unit.model}</p>
                              <p className="text-xs text-forge-muted">{unit.color}</p>
                            </div>
                            <Badge variant="success">{unit.note}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
