"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { DealStage } from "@prisma/client";
import { GripVertical, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, fullName } from "@/lib/utils";

const STAGE_LABELS: Record<DealStage, string> = {
  WALK_IN: "Walk-In",
  QUALIFIED: "Qualified",
  NEEDS_TRADE: "Needs Trade",
  FINANCING: "Financing",
  DEMO_RIDE: "Demo Ride",
  NEGOTIATING: "Negotiating",
  WAITING: "Waiting",
  SOLD: "Sold",
  LOST: "Lost",
  ARCHIVED: "Archived",
};

const STAGE_COLORS: Record<DealStage, string> = {
  WALK_IN: "border-blue-500/30",
  QUALIFIED: "border-cyan-500/30",
  NEEDS_TRADE: "border-purple-500/30",
  FINANCING: "border-amber-500/30",
  DEMO_RIDE: "border-indigo-500/30",
  NEGOTIATING: "border-orange-500/30",
  WAITING: "border-yellow-500/30",
  SOLD: "border-emerald-500/30",
  LOST: "border-red-500/30",
  ARCHIVED: "border-forge-border",
};

export interface PipelineDeal {
  id: string;
  title: string;
  stage: DealStage;
  amount: number | null;
  monthlyTarget: number | null;
  closeProbability: number | null;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    dreamBike: string | null;
  };
  assignedTo: { id: string; name: string; image: string | null } | null;
  inventoryUnit: {
    id: string;
    year: number;
    make: string;
    model: string;
    color: string | null;
    price: number;
  } | null;
}

interface PipelineColumn {
  stage: DealStage;
  deals: PipelineDeal[];
}

function DealCard({ deal, isDragging }: { deal: PipelineDeal; isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: deal.id,
    data: { deal },
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border border-forge-border card-sheen p-3 transition-shadow",
        isDragging && "opacity-50 shadow-lg ring-2 ring-forge-accent/30"
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 cursor-grab text-forge-muted hover:text-forge-foreground active:cursor-grabbing"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <Link
            href={`/customers/${deal.customer.id}`}
            className="text-sm font-medium hover:text-forge-accent line-clamp-2"
          >
            {deal.title}
          </Link>
          <p className="text-xs text-forge-muted mt-0.5">
            {fullName(deal.customer.firstName, deal.customer.lastName)}
          </p>
          {deal.inventoryUnit && (
            <p className="text-xs text-forge-muted-foreground mt-1 truncate">
              {deal.inventoryUnit.year} {deal.inventoryUnit.model}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {deal.amount != null && (
              <Badge variant="secondary">{formatCurrency(deal.amount)}</Badge>
            )}
            {deal.monthlyTarget != null && (
              <Badge variant="outline">${deal.monthlyTarget}/mo</Badge>
            )}
          </div>
          {deal.assignedTo && (
            <div className="flex items-center gap-1 mt-2 text-[10px] text-forge-muted">
              <User className="h-3 w-3" />
              {deal.assignedTo.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StageColumn({ stage, deals }: { stage: DealStage; deals: PipelineDeal[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div className="flex w-[82vw] max-w-[288px] sm:w-72 shrink-0 snap-start flex-col">
      <div
        className={cn(
          "mb-3 flex items-center justify-between rounded-lg border px-3 py-2",
          STAGE_COLORS[stage],
          "bg-forge-surface/50"
        )}
      >
        <h3 className="text-sm font-semibold">{STAGE_LABELS[stage]}</h3>
        <Badge variant="secondary">{deals.length}</Badge>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[200px] flex-1 flex-col gap-2 rounded-lg border border-dashed p-2 transition-colors",
          isOver ? "border-forge-accent/50 bg-forge-accent/5" : "border-forge-border/50"
        )}
      >
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
        {deals.length === 0 && (
          <p className="text-xs text-forge-muted text-center py-8">Drop deals here</p>
        )}
      </div>
    </div>
  );
}

export function PipelineBoard({ initialColumns }: { initialColumns: PipelineColumn[] }) {
  const router = useRouter();
  const [columns, setColumns] = useState(initialColumns);
  const [activeDeal, setActiveDeal] = useState<PipelineDeal | null>(null);
  const [updating, setUpdating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    })
  );

  function findDeal(dealId: string) {
    for (const col of columns) {
      const deal = col.deals.find((d) => d.id === dealId);
      if (deal) return { deal, stage: col.stage };
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    const found = findDeal(String(event.active.id));
    if (found) setActiveDeal(found.deal);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveDeal(null);
    const { active, over } = event;
    if (!over) return;

    const dealId = String(active.id);
    const targetStage = over.id as DealStage;
    const found = findDeal(dealId);
    if (!found || found.stage === targetStage) return;

    const previous = columns;
    setColumns((cols) => {
      const deal = found.deal;
      return cols.map((col) => {
        if (col.stage === found.stage) {
          return { ...col, deals: col.deals.filter((d) => d.id !== dealId) };
        }
        if (col.stage === targetStage) {
          return { ...col, deals: [{ ...deal, stage: targetStage }, ...col.deals] };
        }
        return col;
      });
    });

    setUpdating(true);
    try {
      const res = await fetch(`/api/deals/${dealId}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: targetStage }),
      });
      if (!res.ok) throw new Error("Failed to update");
      router.refresh();
    } catch {
      setColumns(previous);
    } finally {
      setUpdating(false);
    }
  }

  const activeStages = columns.filter((c) => !["ARCHIVED"].includes(c.stage));

  return (
    <div className="relative">
      {updating && (
        <div className="absolute top-0 right-0 z-10">
          <Badge variant="warning">Saving…</Badge>
        </div>
      )}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory sm:snap-none -mx-4 px-4 lg:mx-0 lg:px-0">
          {activeStages.map((col) => (
            <StageColumn key={col.stage} stage={col.stage} deals={col.deals} />
          ))}
        </div>
        <DragOverlay>
          {activeDeal ? <DealCard deal={activeDeal} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
