import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Cake,
  Calendar,
  ChevronRight,
  Flame,
  Handshake,
  TrendingUp,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser, getDealershipId } from "@/lib/auth/session";
import { formatCurrency, fullName } from "@/lib/utils";
import { getDashboardData } from "@/server/services/task.service";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const dealershipId = await getDealershipId();
  const user = await getCurrentUser();
  const data = await getDashboardData(dealershipId, user.id);

  const metrics = [
    { label: "Sold This Month", value: data.metrics.soldThisMonth.toString(), icon: Handshake, accent: true },
    { label: "Closing Ratio", value: `${data.metrics.closingRatio}%`, icon: TrendingUp, accent: false },
    { label: "Customers", value: data.metrics.totalCustomers.toString(), icon: Users, accent: false },
    { label: "Revenue", value: formatCurrency(data.metrics.revenue), icon: Flame, accent: false },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-forge-accent">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <h1 className="mt-1.5 text-2xl lg:text-3xl font-bold tracking-tight">
          {greeting()}, {user.name.split(" ")[0]}
        </h1>
        <p className="text-forge-muted-foreground mt-1 text-sm lg:text-base">
          Here&apos;s what needs your attention today.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={
              metric.accent
                ? "relative overflow-hidden rounded-2xl border border-forge-accent/30 bg-gradient-to-br from-forge-accent/15 via-forge-surface to-forge-surface p-4 lg:p-5"
                : "rounded-2xl border border-forge-border card-sheen p-4 lg:p-5"
            }
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] lg:text-xs font-medium text-forge-muted uppercase tracking-wide">
                {metric.label}
              </p>
              <metric.icon
                className={
                  metric.accent ? "h-4 w-4 text-forge-accent" : "h-4 w-4 text-forge-muted"
                }
              />
            </div>
            <p className="mt-2 text-xl lg:text-3xl font-bold stat-number truncate">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              <Flame className="h-5 w-5 text-forge-accent" />
              Today&apos;s Follow-ups
            </CardTitle>
            <CardDescription>Tasks due today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {data.todayFollowUps.length === 0 ? (
              <p className="text-sm text-forge-muted py-4 text-center">No follow-ups due today</p>
            ) : (
              data.todayFollowUps.map((task) => (
                <Link
                  key={task.id}
                  href={task.customer ? `/customers/${task.customer.id}` : "/tasks"}
                  className="flex items-center justify-between gap-3 rounded-xl border border-forge-border bg-forge-surface-raised/40 p-3 hover:bg-forge-surface-hover active:scale-[0.99] transition-all"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    {task.customer && (
                      <p className="text-xs text-forge-muted truncate">
                        {fullName(task.customer.firstName, task.customer.lastName)}
                      </p>
                    )}
                  </div>
                  <Badge variant="warning" className="shrink-0">Due today</Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              <Calendar className="h-5 w-5 text-forge-accent" />
              Today&apos;s Appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {data.appointments.length === 0 ? (
              <p className="text-sm text-forge-muted py-4 text-center">No appointments today</p>
            ) : (
              data.appointments.map((appt) => (
                <Link
                  key={appt.id}
                  href={`/customers/${appt.customer.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-forge-border bg-forge-surface-raised/40 p-3 hover:bg-forge-surface-hover active:scale-[0.99] transition-all"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{appt.title}</p>
                    <p className="text-xs text-forge-muted truncate">
                      {fullName(appt.customer.firstName, appt.customer.lastName)}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-forge-muted" />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              <Cake className="h-5 w-5 text-forge-accent" />
              Birthdays Today
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {data.birthdays.length === 0 ? (
              <p className="text-sm text-forge-muted py-4 text-center">No birthdays today</p>
            ) : (
              data.birthdays.map((customer) => (
                <Link
                  key={customer.id}
                  href={`/customers/${customer.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-forge-border bg-forge-surface-raised/40 p-3 hover:bg-forge-surface-hover active:scale-[0.99] transition-all"
                >
                  <p className="text-sm font-medium truncate">
                    {fullName(customer.firstName, customer.lastName)}
                  </p>
                  <Badge variant="default" className="shrink-0">Birthday</Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base lg:text-lg">Pending Deals</CardTitle>
            <CardDescription>Negotiating, financing, or waiting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {data.pendingDeals.length === 0 ? (
              <p className="text-sm text-forge-muted py-4 text-center">No pending deals</p>
            ) : (
              data.pendingDeals.map((deal) => (
                <Link
                  key={deal.id}
                  href={`/customers/${deal.customer.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-forge-border bg-forge-surface-raised/40 p-3 hover:bg-forge-surface-hover active:scale-[0.99] transition-all"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{deal.title}</p>
                    <p className="text-xs text-forge-muted truncate">
                      {fullName(deal.customer.firstName, deal.customer.lastName)}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0">{deal.stage.replace(/_/g, " ")}</Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base lg:text-lg">Hot Prospects</CardTitle>
            <CardDescription>High value score customers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {data.hotProspects.length === 0 ? (
              <p className="text-sm text-forge-muted py-4 text-center">No hot prospects</p>
            ) : (
              data.hotProspects.map((customer) => (
                <Link
                  key={customer.id}
                  href={`/customers/${customer.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-forge-border bg-forge-surface-raised/40 p-3 hover:bg-forge-surface-hover active:scale-[0.99] transition-all"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {fullName(customer.firstName, customer.lastName)}
                    </p>
                    <p className="text-xs text-forge-muted truncate">{customer.dreamBike ?? "No dream bike"}</p>
                  </div>
                  <Badge variant="success" className="shrink-0">Score {customer.valueScore}</Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base lg:text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {data.recentActivity.length === 0 ? (
              <p className="text-sm text-forge-muted py-4 text-center">No recent activity</p>
            ) : (
              data.recentActivity.map((activity) => (
                <Link
                  key={activity.id}
                  href={`/customers/${activity.customer.id}`}
                  className="flex items-start justify-between gap-3 rounded-xl border border-forge-border bg-forge-surface-raised/40 p-3 hover:bg-forge-surface-hover active:scale-[0.99] transition-all"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <p className="text-xs text-forge-muted truncate">
                      {fullName(activity.customer.firstName, activity.customer.lastName)}
                    </p>
                  </div>
                  <span className="text-[10px] text-forge-muted whitespace-nowrap shrink-0">
                    {formatDistanceToNow(new Date(activity.occurredAt), { addSuffix: true })}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base lg:text-lg">My Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {data.tasks.length === 0 ? (
            <p className="text-sm text-forge-muted py-4 text-center">All caught up!</p>
          ) : (
            <div className="divide-y divide-forge-border">
              {data.tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    {task.dueAt && (
                      <p className="text-xs text-forge-muted">
                        Due {formatDistanceToNow(new Date(task.dueAt), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                  <Badge variant={task.priority === "HIGH" ? "warning" : "secondary"} className="shrink-0">
                    {task.priority.toLowerCase()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
