"use client";

import { useMemo } from "react";
import {
  addDays,
  format,
  isSameDay,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fullName } from "@/lib/utils";

export interface AppointmentItem {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  isConfirmed: boolean;
  customer: { id: string; firstName: string; lastName: string; phone: string | null };
  user: { id: string; name: string } | null;
}

export function CalendarView({ appointments }: { appointments: AppointmentItem[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const weekStartParam = searchParams.get("week");
  const weekStart = weekStartParam ? new Date(weekStartParam) : startOfWeek(new Date(), { weekStartsOn: 0 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const appointmentsByDay = useMemo(() => {
    const map = new Map<string, AppointmentItem[]>();
    for (const apt of appointments) {
      const key = format(new Date(apt.startsAt), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(apt);
    }
    return map;
  }, [appointments]);

  function navigateWeek(offset: number) {
    const newStart = addDays(weekStart, offset * 7);
    router.push(`/calendar?week=${newStart.toISOString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => navigateWeek(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}
        </h2>
        <Button variant="outline" size="icon" onClick={() => navigateWeek(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayAppointments = appointmentsByDay.get(key) ?? [];
          const isToday = isSameDay(day, new Date());

          return (
            <Card
              key={key}
              className={isToday ? "border-forge-accent/50 bg-forge-accent/5" : ""}
            >
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-xs font-medium text-forge-muted">
                  {format(day, "EEE")}
                </CardTitle>
                <p className={`text-lg font-bold ${isToday ? "text-forge-accent" : ""}`}>
                  {format(day, "d")}
                </p>
              </CardHeader>
              <CardContent className="p-2 pt-0 space-y-1.5 min-h-[100px]">
                {dayAppointments.map((apt) => (
                  <Link
                    key={apt.id}
                    href={`/customers/${apt.customer.id}`}
                    className="block rounded-md border border-forge-border bg-forge-surface p-2 hover:border-forge-accent/30 transition-colors"
                  >
                    <p className="text-[10px] font-medium truncate">{apt.title}</p>
                    <p className="text-[10px] text-forge-muted">
                      {format(new Date(apt.startsAt), "h:mm a")}
                    </p>
                    <p className="text-[10px] text-forge-muted-foreground truncate">
                      {fullName(apt.customer.firstName, apt.customer.lastName)}
                    </p>
                    {apt.isConfirmed && (
                      <Badge variant="success" className="mt-1 text-[8px] px-1 py-0">
                        Confirmed
                      </Badge>
                    )}
                  </Link>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
