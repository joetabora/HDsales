import { Suspense } from "react";
import { Calendar } from "lucide-react";
import { getDealershipId } from "@/lib/auth/session";
import db from "@/lib/db";
import { CalendarView } from "@/features/calendar/components/calendar-view";

export default async function CalendarPage() {
  const dealershipId = await getDealershipId();

  const appointments = await db.appointment.findMany({
    where: { dealershipId, deletedAt: null },
    include: {
      customer: { select: { id: true, firstName: true, lastName: true, phone: true } },
      user: { select: { id: true, name: true } },
    },
    orderBy: { startsAt: "asc" },
  });

  const serialized = appointments.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    startsAt: a.startsAt.toISOString(),
    endsAt: a.endsAt?.toISOString() ?? null,
    location: a.location,
    isConfirmed: a.isConfirmed,
    customer: a.customer,
    user: a.user,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Calendar className="h-6 w-6 text-forge-accent" />
          Calendar
        </h1>
        <p className="text-forge-muted-foreground mt-1">
          {serialized.length} appointment{serialized.length !== 1 ? "s" : ""} scheduled
        </p>
      </div>

      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-forge-surface" />}>
        <CalendarView appointments={serialized} />
      </Suspense>
    </div>
  );
}
