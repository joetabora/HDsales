import Redis from "ioredis";
import { env } from "@/lib/env";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export function getRedis(): Redis {
  if (!globalForRedis.redis) {
    globalForRedis.redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });
  }
  return globalForRedis.redis;
}

export async function connectRedis(): Promise<Redis> {
  const redis = getRedis();
  if (redis.status === "wait" || redis.status === "end") {
    await redis.connect();
  }
  return redis;
}
