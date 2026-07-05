"use client";

import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
  Bike,
  Calendar,
  Mail,
  MessageSquare,
  Mic,
  Phone,
  ShoppingBag,
  StickyNote,
  Users,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type InteractionType =
  | "WALK_IN"
  | "PHONE"
  | "EMAIL"
  | "TEXT"
  | "APPOINTMENT"
  | "DEMO_RIDE"
  | "PURCHASE"
  | "EVENT"
  | "SERVICE"
  | "TRADE"
  | "ACCESSORY"
  | "BIRTHDAY"
  | "NOTE"
  | "VOICE_NOTE";

const typeConfig: Record<
  InteractionType,
  { icon: React.ComponentType<{ className?: string }>; color: string; label: string }
> = {
  WALK_IN: { icon: Users, color: "text-blue-400", label: "Walk-in" },
  PHONE: { icon: Phone, color: "text-green-400", label: "Phone" },
  EMAIL: { icon: Mail, color: "text-purple-400", label: "Email" },
  TEXT: { icon: MessageSquare, color: "text-cyan-400", label: "Text" },
  APPOINTMENT: { icon: Calendar, color: "text-forge-accent", label: "Appointment" },
  DEMO_RIDE: { icon: Bike, color: "text-orange-400", label: "Demo Ride" },
  PURCHASE: { icon: ShoppingBag, color: "text-emerald-400", label: "Purchase" },
  EVENT: { icon: Calendar, color: "text-pink-400", label: "Event" },
  SERVICE: { icon: Wrench, color: "text-gray-400", label: "Service" },
  TRADE: { icon: Bike, color: "text-yellow-400", label: "Trade" },
  ACCESSORY: { icon: ShoppingBag, color: "text-indigo-400", label: "Accessory" },
  BIRTHDAY: { icon: Calendar, color: "text-pink-400", label: "Birthday" },
  NOTE: { icon: StickyNote, color: "text-forge-muted", label: "Note" },
  VOICE_NOTE: { icon: Mic, color: "text-forge-accent", label: "Voice Note" },
};

export type TimelineInteraction = {
  id: string;
  type: InteractionType;
  title: string;
  description: string | null;
  occurredAt: Date | string;
  user: { id: string; name: string; image: string | null } | null;
};

interface TimelineProps {
  interactions: TimelineInteraction[];
}

export function Timeline({ interactions }: TimelineProps) {
  if (interactions.length === 0) {
    return (
      <div className="text-center py-12 text-forge-muted">
        <StickyNote className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No interactions yet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-[19px] top-2 bottom-2 w-px bg-forge-border" />
      <div className="space-y-4">
        {interactions.map((interaction, index) => {
          const config = typeConfig[interaction.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={interaction.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative flex gap-4 pl-0"
            >
              <div
                className={cn(
                  "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-forge-border bg-forge-surface",
                  config.color
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-forge-foreground">
                      {interaction.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[10px] py-0">
                        {config.label}
                      </Badge>
                      {interaction.user && (
                        <span className="text-[10px] text-forge-muted">
                          {interaction.user.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-forge-muted whitespace-nowrap">
                    {formatDistanceToNow(new Date(interaction.occurredAt), { addSuffix: true })}
                  </span>
                </div>
                {interaction.description && (
                  <p className="mt-2 text-sm text-forge-muted-foreground leading-relaxed">
                    {interaction.description}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
