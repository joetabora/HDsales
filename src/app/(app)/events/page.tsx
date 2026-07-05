import { CalendarDays } from "lucide-react";
import { getDealershipId } from "@/lib/auth/session";
import db from "@/lib/db";
import { EventsList } from "@/features/events/components/events-list";
import type { EventItem } from "@/features/events/components/events-list";

export default async function EventsPage() {
  const dealershipId = await getDealershipId();

  const events = await db.event.findMany({
    where: { dealershipId, deletedAt: null },
    include: {
      attendances: true,
      _count: { select: { registrations: true, attendances: true } },
    },
    orderBy: { startsAt: "desc" },
  });

  const serialized: EventItem[] = events.map((event) => {
    const purchases = event.attendances.filter((a) => a.purchasedAfter).length;
    const attendances = event._count.attendances;
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      startsAt: event.startsAt.toISOString(),
      endsAt: event.endsAt?.toISOString() ?? null,
      status: event.status,
      registrations: event._count.registrations,
      attendances,
      purchases,
      conversionRate: attendances > 0 ? Math.round((purchases / attendances) * 100) : 0,
      estimatedRevenue: purchases * 28500,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-forge-accent" />
          Events
        </h1>
        <p className="text-forge-muted-foreground mt-1">
          Track event performance and ROI
        </p>
      </div>

      <EventsList events={serialized} />
    </div>
  );
}
