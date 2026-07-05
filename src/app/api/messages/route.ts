import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getDealershipId, getCurrentUser } from "@/lib/auth/session";
import { getMessaging } from "@/lib/messaging";

export async function GET() {
  try {
    const dealershipId = await getDealershipId();

    const [messages, templates] = await Promise.all([
      db.message.findMany({
        where: { dealershipId },
        include: {
          customer: { select: { id: true, firstName: true, lastName: true } },
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      db.messageTemplate.findMany({
        where: { dealershipId, isActive: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return NextResponse.json({ messages, templates });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list messages";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const dealershipId = await getDealershipId();
    const user = await getCurrentUser();
    const body = await request.json();

    const result = await getMessaging().send({
      dealershipId,
      customerId: body.customerId,
      userId: user.id,
      channel: body.channel,
      toAddress: body.toAddress,
      subject: body.subject,
      body: body.body,
    });

    const message = await db.message.findUnique({
      where: { id: result.id },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send message";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
