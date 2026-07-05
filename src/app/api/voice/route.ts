import { NextResponse } from "next/server";
import { z } from "zod";
import db from "@/lib/db";
import { devProvider } from "@/lib/ai/providers/dev";
import { getCurrentUser, getDealershipId } from "@/lib/auth/session";
import { addInteraction } from "@/server/services/customer.service";

const voiceExtractionSchema = z.object({
  summary: z.string(),
  extractedFacts: z.record(z.string(), z.string()),
  suggestedTasks: z.array(z.object({ title: z.string(), dueInDays: z.number() })),
  followUpDraft: z.string(),
});

export async function POST(request: Request) {
  try {
    const dealershipId = await getDealershipId();
    const user = await getCurrentUser();
    const formData = await request.formData();
    const customerId = formData.get("customerId") as string;
    const audio = formData.get("audio") as File | null;

    if (!customerId || !audio) {
      return NextResponse.json({ error: "Missing customerId or audio" }, { status: 400 });
    }

    const customer = await db.customer.findFirst({
      where: { id: customerId, dealershipId, deletedAt: null },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const buffer = Buffer.from(await audio.arrayBuffer());
    const transcription = await devProvider.transcribe(buffer, audio.type || "audio/webm");
    const extraction = await devProvider.extractStructured(
      `voice transcript: ${transcription.text}`,
      voiceExtractionSchema
    );

    const voiceNote = await db.voiceNote.create({
      data: {
        customerId,
        userId: user.id,
        audioUrl: `/uploads/voice/${customerId}-${Date.now()}.webm`,
        durationSec: transcription.durationSec,
        transcript: transcription.text,
        summary: extraction.summary,
        extractedFacts: extraction.extractedFacts,
        status: "completed",
      },
    });

    await addInteraction(customerId, user.id, {
      type: "VOICE_NOTE",
      title: "Voice note captured",
      description: extraction.summary,
      metadata: { voiceNoteId: voiceNote.id, extractedFacts: extraction.extractedFacts },
    });

    if (extraction.extractedFacts.dreamBike) {
      await db.customer.update({
        where: { id: customerId },
        data: {
          dreamBike: extraction.extractedFacts.dreamBike,
          spouseName: extraction.extractedFacts.spouseName ?? customer.spouseName,
          creditConcerns: extraction.extractedFacts.biggestObjection ?? customer.creditConcerns,
        },
      });
    }

    return NextResponse.json({
      voiceNote,
      transcription: transcription.text,
      extraction,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Voice processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
