import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Cake,
  Calendar,
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

export default async function DashboardPage() {
  const dealershipId = await getDealershipId();
  const user = await getCurrentUser();
  const data = await getDashboardData(dealershipId, user.id);

  const metrics = [
    { label: "Sold This Month", value: data.metrics.soldThisMonth.toString(), icon: Handshake },
    { label: "Closing Ratio", value: `${data.metrics.closingRatio}%`, icon: TrendingUp },
    { label: "Customers", value: data.metrics.totalCustomers.toString(), icon: Users },
    { label: "Revenue", value: formatCurrency(data.metrics.revenue), icon: Flame },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Good morning, {user.name.split(" ")[0]}
        </h1>
        <p className="text-forge-muted-foreground mt-1">
          Here&apos;s what needs your attention today.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>{metric.label}</CardDescription>
              <metric.icon className="h-4 w-4 text-forge-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-forge-accent" />
              Today&apos;s Follow-ups
            </CardTitle>
            <CardDescription>Tasks due today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.todayFollowUps.length === 0 ? (
              <p className="text-sm text-forge-muted py-4 text-center">No follow-ups due today</p>
            ) : (
              data.todayFollowUps.map((task) => (
                <Link
                  key={task.id}
                  href={task.customer ? `/customers/${task.customer.id}` : "/tasks"}
                  className="flex items-center justify-between rounded-lg border border-forge-border p-3 hover:bg-forge-surface-hover transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{task.title}</p>
                    {task.customer && (
                      <p className="text-xs text-forge-muted">
                        {fullName(task.customer.firstName, task.customer.lastName)}
                      </p>
                    )}
                  </div>
                  <Badge variant="warning">Due today</Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-forge-accent" />
              Today&apos;s Appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.appointments.length === 0 ? (
              <p className="text-sm text-forge-muted py-4 text-center">No appointments today</p>
            ) : (
              data.appointments.map((appt) => (
                <Link
                  key={appt.id}
                  href={`/customers/${appt.customer.id}`}
                  className="flex items-center justify-between rounded-lg border border-forge-border p-3 hover:bg-forge-surface-hover transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{appt.title}</p>
                    <p className="text-xs text-forge-muted">
                      {fullName(appt.customer.firstName, appt.customer.lastName)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cake className="h-5 w-5 text-forge-accent" />
              Birthdays Today
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.birthdays.length === 0 ? (
              <p className="text-sm text-forge-muted py-4 text-center">No birthdays today</p>
            ) : (
              data.birthdays.map((customer) => (
                <Link
                  key={customer.id}
                  href={`/customers/${customer.id}`}
                  className="flex items-center justify-between rounded-lg border border-forge-border p-3 hover:bg-forge-surface-hover transition-colors"
                >
                  <p className="text-sm font-medium">
                    {fullName(customer.firstName, customer.lastName)}
                  </p>
                  <Badge variant="default">Birthday</Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Deals</CardTitle>
            <CardDescription>Negotiating, financing, or waiting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.pendingDeals.length === 0 ? (
              <p className="text-sm text-forge-muted py-4 text-center">No pending deals</p>
            ) : (
              data.pendingDeals.map((deal) => (
                <Link
                  key={deal.id}
                  href={`/customers/${deal.customer.id}`}
                  className="flex items-center justify-between rounded-lg border border-forge-border p-3 hover:bg-forge-surface-hover transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{deal.title}</p>
                    <p className="text-xs text-forge-muted">
                      {fullName(deal.customer.firstName, deal.customer.lastName)}
                    </p>
                  </div>
                  <Badge variant="outline">{deal.stage.replace(/_/g, " ")}</Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hot Prospects</CardTitle>
            <CardDescription>High value score customers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.hotProspects.length === 0 ? (
              <p className="text-sm text-forge-muted py-4 text-center">No hot prospects</p>
            ) : (
              data.hotProspects.map((customer) => (
                <Link
                  key={customer.id}
                  href={`/customers/${customer.id}`}
                  className="flex items-center justify-between rounded-lg border border-forge-border p-3 hover:bg-forge-surface-hover transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {fullName(customer.firstName, customer.lastName)}
                    </p>
                    <p className="text-xs text-forge-muted">{customer.dreamBike ?? "No dream bike"}</p>
                  </div>
                  <Badge variant="success">Score {customer.valueScore}</Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentActivity.length === 0 ? (
              <p className="text-sm text-forge-muted py-4 text-center">No recent activity</p>
            ) : (
              data.recentActivity.map((activity) => (
                <Link
                  key={activity.id}
                  href={`/customers/${activity.customer.id}`}
                  className="flex items-start justify-between rounded-lg border border-forge-border p-3 hover:bg-forge-surface-hover transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-forge-muted">
                      {fullName(activity.customer.firstName, activity.customer.lastName)}
                    </p>
                  </div>
                  <span className="text-[10px] text-forge-muted whitespace-nowrap">
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
          <CardTitle>My Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {data.tasks.length === 0 ? (
            <p className="text-sm text-forge-muted py-4 text-center">All caught up!</p>
          ) : (
            <div className="divide-y divide-forge-border">
              {data.tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{task.title}</p>
                    {task.dueAt && (
                      <p className="text-xs text-forge-muted">
                        Due {formatDistanceToNow(new Date(task.dueAt), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                  <Badge variant={task.priority === "HIGH" ? "warning" : "secondary"}>
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
