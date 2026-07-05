"use client";

import { format, formatDistanceToNow } from "date-fns";
import { CalendarDays, DollarSign, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export interface EventItem {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
  status: string;
  registrations: number;
  attendances: number;
  purchases: number;
  conversionRate: number;
  estimatedRevenue: number;
}

const STATUS_VARIANT: Record<string, "default" | "success" | "secondary" | "destructive"> = {
  PUBLISHED: "success",
  DRAFT: "secondary",
  COMPLETED: "default",
  CANCELLED: "destructive",
};

export function EventsList({ events }: { events: EventItem[] }) {
  const totalRevenue = events.reduce((sum, e) => sum + e.estimatedRevenue, 0);
  const totalAttendees = events.reduce((sum, e) => sum + e.attendances, 0);
  const avgConversion =
    events.length > 0
      ? Math.round(events.reduce((sum, e) => sum + e.conversionRate, 0) / events.length)
      : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> Event Revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Users className="h-3 w-3" /> Total Attendees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalAttendees}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Avg Conversion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{avgConversion}%</p>
          </CardContent>
        </Card>
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl border border-forge-border bg-forge-surface/50 p-12 text-center">
          <CalendarDays className="h-12 w-12 text-forge-muted mx-auto mb-3" />
          <p className="text-lg font-medium">No events yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  {event.description && (
                    <CardDescription className="mt-1">{event.description}</CardDescription>
                  )}
                </div>
                <Badge variant={STATUS_VARIANT[event.status] ?? "secondary"}>
                  {event.status.toLowerCase()}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                  <div>
                    <p className="text-forge-muted text-xs">Date</p>
                    <p className="font-medium">
                      {format(new Date(event.startsAt), "MMM d, yyyy h:mm a")}
                    </p>
                    <p className="text-xs text-forge-muted">
                      {formatDistanceToNow(new Date(event.startsAt), { addSuffix: true })}
                    </p>
                  </div>
                  {event.location && (
                    <div>
                      <p className="text-forge-muted text-xs">Location</p>
                      <p className="font-medium">{event.location}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-forge-muted text-xs">Registrations / Attendance</p>
                    <p className="font-medium">
                      {event.registrations} registered · {event.attendances} attended
                    </p>
                  </div>
                  <div>
                    <p className="text-forge-muted text-xs">ROI</p>
                    <p className="font-medium text-forge-accent">
                      {event.conversionRate}% conversion · {formatCurrency(event.estimatedRevenue)}
                    </p>
                    <p className="text-xs text-forge-muted">{event.purchases} purchase(s) after event</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
