import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { addInteraction, addNote } from "@/server/services/customer.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params;
    const user = await getCurrentUser();
    const body = await request.json();

    const interaction = await addInteraction(customerId, user.id, {
      type: body.type,
      title: body.title,
      description: body.description,
    });

    if (body.description && body.type === "NOTE") {
      await addNote(customerId, user.id, body.description);
    }

    return NextResponse.json(interaction, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to log interaction";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
