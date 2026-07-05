import "dotenv/config";
import { createWorker, QUEUE_NAMES } from "@/lib/queue";
import db from "@/lib/db";
import { getAIProvider } from "@/lib/ai";
import { processFollowUpEnrollments } from "@/server/services/follow-up.service";
import { devProvider } from "@/lib/ai/providers/dev";
import { z } from "zod";

console.log("[Forge Worker] Starting background workers...");

const voiceSchema = z.object({
  summary: z.string(),
  extractedFacts: z.record(z.string(), z.string()),
  suggestedTasks: z.array(z.object({ title: z.string(), dueInDays: z.number() })),
  followUpDraft: z.string(),
});

createWorker<{ noteId: string; content: string }>(
  QUEUE_NAMES.EMBEDDINGS,
  async (job) => {
    const ai = getAIProvider();
    const embedding = await ai.embed(job.data.content);
    await db.$executeRawUnsafe(
      `UPDATE notes SET embedding = $1::vector WHERE id = $2`,
      `[${embedding.join(",")}]`,
      job.data.noteId
    );
    console.log(`[Embeddings] Processed note ${job.data.noteId}`);
  }
);

createWorker<{ voiceNoteId: string }>(QUEUE_NAMES.VOICE, async (job) => {
  const voiceNote = await db.voiceNote.findUnique({
    where: { id: job.data.voiceNoteId },
    include: { customer: true },
  });
  if (!voiceNote) return;

  const ai = getAIProvider();
  const transcript =
    voiceNote.transcript ??
    (await ai.transcribe(Buffer.from(""), "audio/webm")).text;

  const extraction = await ai.extractStructured(
    `Extract from voice transcript: ${transcript}`,
    voiceSchema
  );

  await db.voiceNote.update({
    where: { id: voiceNote.id },
    data: {
      transcript,
      summary: extraction.summary,
      extractedFacts: extraction.extractedFacts,
      status: "completed",
    },
  });

  for (const task of extraction.suggestedTasks) {
    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + task.dueInDays);
    await db.task.create({
      data: {
        dealershipId: voiceNote.customer.dealershipId,
        customerId: voiceNote.customerId,
        createdById: voiceNote.userId,
        assignedToId: voiceNote.userId,
        title: task.title,
        dueAt,
        priority: "MEDIUM",
      },
    });
  }

  console.log(`[Voice] Processed voice note ${voiceNote.id}`);
});

createWorker(QUEUE_NAMES.FOLLOW_UP, async () => {
  await processFollowUpEnrollments();
  console.log("[FollowUp] Processed due enrollments");
});

console.log("[Forge Worker] All workers running");
