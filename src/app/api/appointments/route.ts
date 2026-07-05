import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getDealershipId } from "@/lib/auth/session";

export async function GET(request: Request) {
  try {
    const dealershipId = await getDealershipId();
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where = {
      dealershipId,
      deletedAt: null,
      ...(from || to
        ? {
            startsAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    };

    const appointments = await db.appointment.findMany({
      where,
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, phone: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { startsAt: "asc" },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list appointments";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
