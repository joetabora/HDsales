import { addDays } from "date-fns";
import { createTask } from "@/server/services/task.service";

/** Default walk-in follow-up cadence — no Redis required. */
export const WALK_IN_CADENCE = [
  { delayDays: 1, title: "Send follow-up text", priority: "HIGH" as const },
  { delayDays: 3, title: "3-day check-in call", priority: "MEDIUM" as const },
  { delayDays: 7, title: "7-day check-in", priority: "MEDIUM" as const },
  { delayDays: 30, title: "30-day touch base", priority: "LOW" as const },
];

export async function scheduleWalkInCadence(input: {
  dealershipId: string;
  customerId: string;
  assignedToId?: string;
  createdById?: string;
  customerName?: string;
}) {
  const now = new Date();
  const tasks = [];

  for (const step of WALK_IN_CADENCE) {
    const task = await createTask({
      dealershipId: input.dealershipId,
      customerId: input.customerId,
      assignedToId: input.assignedToId,
      createdById: input.createdById,
      title: step.title,
      description: input.customerName
        ? `Follow-up for ${input.customerName}`
        : undefined,
      dueAt: addDays(now, step.delayDays),
      priority: step.priority,
    });
    tasks.push(task);
  }

  return tasks;
}
