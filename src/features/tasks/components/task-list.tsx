"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNow, isPast, isToday } from "date-fns";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, fullName } from "@/lib/utils";

export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueAt: string | null;
  customer: { id: string; firstName: string; lastName: string } | null;
  assignedTo: { id: string; name: string; image: string | null } | null;
}

const PRIORITY_VARIANT: Record<string, "destructive" | "warning" | "secondary" | "outline"> = {
  URGENT: "destructive",
  HIGH: "warning",
  MEDIUM: "secondary",
  LOW: "outline",
};

export function TaskList({ initialTasks }: { initialTasks: TaskItem[] }) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [completingId, setCompletingId] = useState<string | null>(null);

  async function completeTask(taskId: string) {
    setCompletingId(taskId);
    try {
      const res = await fetch(`/api/tasks/${taskId}/complete`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      router.refresh();
    } catch {
      // keep task visible on failure
    } finally {
      setCompletingId(null);
    }
  }

  const openTasks = tasks.filter((t) => t.status !== "COMPLETED");
  const overdue = openTasks.filter((t) => t.dueAt && isPast(new Date(t.dueAt)) && !isToday(new Date(t.dueAt)));

  if (openTasks.length === 0) {
    return (
      <div className="rounded-xl border border-forge-border bg-forge-surface/50 p-12 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
        <p className="text-lg font-medium">All caught up!</p>
        <p className="text-sm text-forge-muted mt-1">No open tasks remaining.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {overdue.length > 0 && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm font-medium text-red-400">{overdue.length} overdue task(s)</p>
        </div>
      )}

      <div className="rounded-xl border border-forge-border bg-forge-surface/50 divide-y divide-forge-border">
        {openTasks.map((task) => {
          const isOverdue =
            task.dueAt && isPast(new Date(task.dueAt)) && !isToday(new Date(task.dueAt));

          return (
            <div
              key={task.id}
              className="flex items-start gap-4 p-4 hover:bg-forge-surface-hover transition-colors"
            >
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 mt-0.5"
                disabled={completingId === task.id}
                onClick={() => completeTask(task.id)}
              >
                {completingId === task.id ? (
                  <Loader2 className="h-5 w-5 animate-spin text-forge-muted" />
                ) : (
                  <Circle className="h-5 w-5 text-forge-muted hover:text-forge-accent" />
                )}
              </Button>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{task.title}</p>
                {task.description && (
                  <p className="text-xs text-forge-muted mt-0.5 line-clamp-2">{task.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {task.customer && (
                    <Link
                      href={`/customers/${task.customer.id}`}
                      className="text-xs text-forge-accent hover:underline"
                    >
                      {fullName(task.customer.firstName, task.customer.lastName)}
                    </Link>
                  )}
                  {task.dueAt && (
                    <span
                      className={cn(
                        "text-xs",
                        isOverdue ? "text-red-400" : "text-forge-muted"
                      )}
                    >
                      Due {formatDistanceToNow(new Date(task.dueAt), { addSuffix: true })}
                      {" · "}
                      {format(new Date(task.dueAt), "MMM d")}
                    </span>
                  )}
                  {task.assignedTo && (
                    <span className="text-xs text-forge-muted">→ {task.assignedTo.name}</span>
                  )}
                </div>
              </div>

              <Badge variant={PRIORITY_VARIANT[task.priority] ?? "secondary"}>
                {task.priority.toLowerCase()}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
