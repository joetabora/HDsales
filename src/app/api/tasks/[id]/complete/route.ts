import { NextResponse } from "next/server";
import { getDealershipId } from "@/lib/auth/session";
import { completeTask } from "@/server/services/task.service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dealershipId = await getDealershipId();
    const task = await completeTask(id, dealershipId);
    return NextResponse.json(task);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to complete task";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
