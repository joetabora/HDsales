import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDealershipId } from "@/lib/auth/session";
import { formatPhone, fullName } from "@/lib/utils";
import {
  getCustomerById,
  getCustomerTimeline,
} from "@/server/services/customer.service";
import { buildWalkUpCard } from "@/server/services/walkup.service";
import { Timeline } from "@/features/customers/components/timeline";
import { WalkUpCard } from "@/features/customers/components/walk-up-card";
import { CustomerEditForm } from "@/features/customers/components/customer-edit-form";
import { LogInteraction } from "@/features/customers/components/log-interaction";
import { StartDealForm } from "@/features/customers/components/start-deal-form";
import { NewTaskForm } from "@/features/customers/components/new-task-form";

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  const dealershipId = await getDealershipId();

  const [customer, timeline, walkUp] = await Promise.all([
    getCustomerById(id, dealershipId),
    getCustomerTimeline(id),
    buildWalkUpCard(id, dealershipId),
  ]);

  if (!customer || !walkUp) {
    notFound();
  }

  const name = fullName(customer.firstName, customer.lastName);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/customers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
            <Badge variant={customer.valueScore >= 70 ? "success" : "secondary"}>
              Score {customer.valueScore}
            </Badge>
            {customer.tags.map(({ tag }) => (
              <Badge
                key={tag.id}
                variant="outline"
                style={{ borderColor: `${tag.color}40`, color: tag.color }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-forge-muted">
            {customer.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {customer.email}
              </span>
            )}
            {customer.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {formatPhone(customer.phone)}
              </span>
            )}
            {customer.assignedTo && (
              <span>Assigned to {customer.assignedTo.name}</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <WalkUpCard data={walkUp} customerId={customer.id} />

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline interactions={timeline} />
            </CardContent>
          </Card>

          <CustomerEditForm customer={customer} />
        </div>

        <div className="space-y-6">
          <LogInteraction customerId={customer.id} />
          <StartDealForm customerId={customer.id} customerName={name} />
          <NewTaskForm customerId={customer.id} customerName={name} />

          {customer.tasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Open Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {customer.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg border border-forge-border p-2.5"
                  >
                    <p className="text-sm">{task.title}</p>
                    <Badge variant="warning">{task.priority.toLowerCase()}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
