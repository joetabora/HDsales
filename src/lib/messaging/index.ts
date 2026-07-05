import db from "@/lib/db";
import { MessageChannel, MessageStatus } from "@prisma/client";

export interface SendMessageInput {
  dealershipId: string;
  customerId?: string;
  userId?: string;
  channel: MessageChannel;
  toAddress: string;
  subject?: string;
  body: string;
}

export interface MessagingAdapter {
  send(input: SendMessageInput): Promise<{ id: string; status: MessageStatus }>;
}

class DevMessagingAdapter implements MessagingAdapter {
  async send(input: SendMessageInput) {
    const message = await db.message.create({
      data: {
        dealershipId: input.dealershipId,
        customerId: input.customerId,
        userId: input.userId,
        channel: input.channel,
        status: MessageStatus.DELIVERED,
        subject: input.subject,
        body: input.body,
        toAddress: input.toAddress,
        fromAddress: input.channel === MessageChannel.EMAIL ? "sales@forge.app" : "+15555550100",
        deliveredAt: new Date(),
        metadata: { provider: "dev", simulated: true },
      },
    });

    console.log(
      `[Forge Dev Outbox] ${input.channel} to ${input.toAddress}: ${input.body.slice(0, 100)}...`
    );

    return { id: message.id, status: MessageStatus.DELIVERED };
  }
}

let messagingInstance: MessagingAdapter | null = null;

export function getMessaging(): MessagingAdapter {
  if (!messagingInstance) {
    messagingInstance = new DevMessagingAdapter();
  }
  return messagingInstance;
}
