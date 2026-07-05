import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getDealershipId } from "@/lib/auth/session";

export async function GET() {
  try {
    const dealershipId = await getDealershipId();

    const events = await db.event.findMany({
      where: { dealershipId, deletedAt: null },
      include: {
        registrations: { include: { customer: { select: { id: true, firstName: true, lastName: true } } } },
        attendances: true,
        _count: { select: { registrations: true, attendances: true } },
      },
      orderBy: { startsAt: "desc" },
    });

    const withRoi = events.map((event) => {
      const registrations = event._count.registrations;
      const attendances = event._count.attendances;
      const purchases = event.attendances.filter((a) => a.purchasedAfter).length;
      const conversionRate = attendances > 0 ? Math.round((purchases / attendances) * 100) : 0;
      const estimatedRevenue = purchases * 28500;

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        status: event.status,
        registrations,
        attendances,
        purchases,
        conversionRate,
        estimatedRevenue,
      };
    });

    return NextResponse.json(withRoi);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list events";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
