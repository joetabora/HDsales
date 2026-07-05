import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getDealershipId } from "@/lib/auth/session";
import db from "@/lib/db";
import { formatPhone, fullName } from "@/lib/utils";

export default async function LeadsPage() {
  const dealershipId = await getDealershipId();

  const leads = await db.customer.findMany({
    where: {
      dealershipId,
      deletedAt: null,
      deals: { none: { stage: "SOLD", deletedAt: null } },
    },
    include: {
      assignedTo: { select: { id: true, name: true } },
      deals: { where: { deletedAt: null }, orderBy: { updatedAt: "desc" }, take: 1 },
      tags: { include: { tag: true } },
      _count: { select: { interactions: true } },
    },
    orderBy: { valueScore: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <UserPlus className="h-6 w-6 text-forge-accent" />
          Unsold Leads
        </h1>
        <p className="text-forge-muted-foreground mt-1">
          {leads.length} lead{leads.length !== 1 ? "s" : ""} without a closed sale
        </p>
      </div>

      {leads.length === 0 ? (
        <div className="rounded-xl border border-forge-border bg-forge-surface/50 p-12 text-center">
          <p className="text-lg font-medium">No unsold leads</p>
        </div>
      ) : (
        <div className="rounded-xl border border-forge-border bg-forge-surface/50 divide-y divide-forge-border">
          {leads.map((lead) => (
            <Link
              key={lead.id}
              href={`/customers/${lead.id}`}
              className="flex items-center justify-between gap-4 p-4 hover:bg-forge-surface-hover transition-colors"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {fullName(lead.firstName, lead.lastName)}
                </p>
                <p className="text-sm text-forge-muted truncate">
                  {lead.dreamBike ?? lead.currentBike ?? "No bike preference"}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {lead.phone && (
                    <span className="text-xs text-forge-muted">{formatPhone(lead.phone)}</span>
                  )}
                  {lead.assignedTo && (
                    <span className="text-xs text-forge-muted">→ {lead.assignedTo.name}</span>
                  )}
                  {lead.deals[0] && (
                    <Badge variant="secondary">{lead.deals[0].stage.replace(/_/g, " ").toLowerCase()}</Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <Badge variant={lead.valueScore >= 70 ? "success" : lead.valueScore >= 50 ? "warning" : "secondary"}>
                  Score {lead.valueScore}
                </Badge>
                <span className="text-xs text-forge-muted">{lead._count.interactions} interactions</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
