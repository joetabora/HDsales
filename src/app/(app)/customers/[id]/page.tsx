import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getDealershipId } from "@/lib/auth/session";
import { formatPhone, fullName } from "@/lib/utils";
import {
  getCustomerById,
  getCustomerTimeline,
} from "@/server/services/customer.service";
import { getLatestDealBrief } from "@/server/services/ai.service";
import { Timeline } from "@/features/customers/components/timeline";
import { AiInsightsPanel } from "@/features/customers/components/ai-insights-panel";
import { DealBriefCard } from "@/features/customers/components/deal-brief-card";
import { VoiceCapture } from "@/features/customers/components/voice-capture";

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  const dealershipId = await getDealershipId();

  const [customer, timeline, latestBrief] = await Promise.all([
    getCustomerById(id, dealershipId),
    getCustomerTimeline(id),
    getLatestDealBrief(id),
  ]);

  if (!customer) {
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
          <DealBriefCard
            customerId={customer.id}
            customerName={name}
            initialBrief={latestBrief}
          />

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline interactions={timeline} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <AiInsightsPanel customerId={customer.id} insights={customer.aiInsights} />

          <VoiceCapture customerId={customer.id} />

          {(customer.dreamBike || customer.currentBike) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bike Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {customer.dreamBike && (
                  <div>
                    <p className="text-xs text-forge-muted uppercase tracking-wider">Dream Bike</p>
                    <p className="text-sm font-medium mt-0.5">{customer.dreamBike}</p>
                  </div>
                )}
                {customer.currentBike && (
                  <div>
                    <p className="text-xs text-forge-muted uppercase tracking-wider">Current Bike</p>
                    <p className="text-sm font-medium mt-0.5">{customer.currentBike}</p>
                  </div>
                )}
                {customer.spouseName && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-forge-muted uppercase tracking-wider">Spouse</p>
                      <p className="text-sm font-medium mt-0.5">{customer.spouseName}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

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
