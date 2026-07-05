import { CheckSquare } from "lucide-react";
import { getDealershipId } from "@/lib/auth/session";
import { listTasks } from "@/server/services/task.service";
import { TaskList } from "@/features/tasks/components/task-list";
import type { TaskItem } from "@/features/tasks/components/task-list";

export default async function TasksPage() {
  const dealershipId = await getDealershipId();
  const tasks = await listTasks(dealershipId);

  const serialized: TaskItem[] = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    dueAt: t.dueAt?.toISOString() ?? null,
    customer: t.customer,
    assignedTo: t.assignedTo,
  }));

  const openCount = serialized.filter((t) => t.status !== "COMPLETED").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-forge-accent" />
          Tasks
        </h1>
        <p className="text-forge-muted-foreground mt-1">
          {openCount} open task{openCount !== 1 ? "s" : ""}
        </p>
      </div>

      <TaskList initialTasks={serialized} />
    </div>
  );
}
