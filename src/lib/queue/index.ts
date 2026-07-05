import { Queue, Worker, type Job } from "bullmq";
import { getRedis } from "@/lib/redis";

export const QUEUE_NAMES = {
  EMBEDDINGS: "embeddings",
  FOLLOW_UP: "follow-up",
  VOICE: "voice-processing",
  MESSAGING: "messaging",
} as const;

const connection = {
  host: new URL(process.env.REDIS_URL ?? "redis://localhost:6379").hostname,
  port: parseInt(
    new URL(process.env.REDIS_URL ?? "redis://localhost:6379").port || "6379"
  ),
};

export function createQueue(name: string) {
  return new Queue(name, { connection });
}

export function createWorker<T>(
  name: string,
  processor: (job: Job<T>) => Promise<void>
) {
  return new Worker(name, processor, { connection });
}

export async function enqueueEmbedding(noteId: string, content: string) {
  const queue = createQueue(QUEUE_NAMES.EMBEDDINGS);
  await queue.add("embed-note", { noteId, content });
}

export async function enqueueVoiceProcessing(voiceNoteId: string) {
  const queue = createQueue(QUEUE_NAMES.VOICE);
  await queue.add("process-voice", { voiceNoteId });
}

export async function enqueueFollowUpCheck() {
  const queue = createQueue(QUEUE_NAMES.FOLLOW_UP);
  await queue.add("check-due", {}, { repeat: { every: 60000 } });
}

export { getRedis };
