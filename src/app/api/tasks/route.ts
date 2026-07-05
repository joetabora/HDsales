import { NextResponse } from "next/server";
import type { TaskStatus } from "@prisma/client";
import { getDealershipId, getCurrentUser } from "@/lib/auth/session";
import { createTask, listTasks } from "@/server/services/task.service";

export async function GET(request: Request) {
  try {
    const dealershipId = await getDealershipId();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as TaskStatus | null;
    const assignedToId = searchParams.get("assignedToId") ?? undefined;

    const tasks = await listTasks(dealershipId, {
      ...(status ? { status } : {}),
      ...(assignedToId ? { assignedToId } : {}),
    });

    return NextResponse.json(tasks);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list tasks";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const dealershipId = await getDealershipId();
    const user = await getCurrentUser();
    const body = await request.json();

    const task = await createTask({
      dealershipId,
      title: body.title,
      description: body.description,
      customerId: body.customerId,
      assignedToId: body.assignedToId ?? user.id,
      createdById: user.id,
      dueAt: body.dueAt ? new Date(body.dueAt) : undefined,
      priority: body.priority,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create task";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
