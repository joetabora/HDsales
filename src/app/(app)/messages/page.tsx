import { MessageSquare } from "lucide-react";
import { getDealershipId } from "@/lib/auth/session";
import db from "@/lib/db";
import { MessagingCenter } from "@/features/messages/components/messaging-center";

export default async function MessagesPage() {
  const dealershipId = await getDealershipId();

  const [messages, templates] = await Promise.all([
    db.message.findMany({
      where: { dealershipId },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.messageTemplate.findMany({
      where: { dealershipId, isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const serializedMessages = messages.map((m) => ({
    id: m.id,
    channel: m.channel,
    status: m.status,
    subject: m.subject,
    body: m.body,
    toAddress: m.toAddress,
    createdAt: m.createdAt.toISOString(),
    customer: m.customer,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-forge-accent" />
          Messages
        </h1>
        <p className="text-forge-muted-foreground mt-1">
          Send SMS and email to customers
        </p>
      </div>

      <MessagingCenter initialMessages={serializedMessages} templates={templates} />
    </div>
  );
}
