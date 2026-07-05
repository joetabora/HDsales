"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare, Phone, StickyNote, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const QUICK_ACTIONS = [
  { type: "PHONE", label: "Called", icon: Phone },
  { type: "TEXT", label: "Texted", icon: MessageSquare },
  { type: "WALK_IN", label: "Walk-in", icon: UserRound },
  { type: "NOTE", label: "Note", icon: StickyNote },
] as const;

interface LogInteractionProps {
  customerId: string;
}

export function LogInteraction({ customerId }: LogInteractionProps) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  async function log(type: string, label: string) {
    setLoading(type);
    try {
      await fetch(`/api/customers/${customerId}/interactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: label,
          description: note.trim() || undefined,
        }),
      });
      setNote("");
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Log Interaction</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map(({ type, label, icon: Icon }) => (
            <Button
              key={type}
              variant="outline"
              size="sm"
              disabled={loading !== null}
              onClick={() => log(type, label)}
              className="justify-start gap-2"
            >
              {loading === type ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icon className="h-4 w-4 text-forge-accent" />
              )}
              {label}
            </Button>
          ))}
        </div>
        <Textarea
          placeholder="Optional note…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />
      </CardContent>
    </Card>
  );
}
