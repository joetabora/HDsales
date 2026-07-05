import { z } from "zod";

const optionalUrl = z
  .string()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined))
  .pipe(z.string().url().optional());

const optionalString = z
  .string()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z
    .string()
    .default("postgresql://forge:forge_dev_password@localhost:5432/forge"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32)
    .default("forge-dev-secret-change-in-production-min-32-chars"),
  BETTER_AUTH_URL: optionalUrl,
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  GOOGLE_CLIENT_ID: optionalString,
  GOOGLE_CLIENT_SECRET: optionalString,
  APPLE_CLIENT_ID: optionalString,
  APPLE_CLIENT_SECRET: optionalString,
  AI_PROVIDER: z
    .enum(["dev", "openai", "anthropic", "gemini", "ollama"])
    .default("dev"),
  OPENAI_API_KEY: optionalString,
  ANTHROPIC_API_KEY: optionalString,
  GEMINI_API_KEY: optionalString,
  OLLAMA_BASE_URL: optionalUrl,
  STORAGE_PROVIDER: z.enum(["local", "supabase", "r2"]).default("local"),
  LOCAL_STORAGE_PATH: z.string().default("./uploads"),
  SUPABASE_URL: optionalUrl,
  SUPABASE_SERVICE_KEY: optionalString,
  SUPABASE_BUCKET: optionalString,
  R2_ACCOUNT_ID: optionalString,
  R2_ACCESS_KEY_ID: optionalString,
  R2_SECRET_ACCESS_KEY: optionalString,
  R2_BUCKET: optionalString,
  MESSAGING_PROVIDER: z.enum(["dev", "twilio-resend"]).default("dev"),
  TWILIO_ACCOUNT_SID: optionalString,
  TWILIO_AUTH_TOKEN: optionalString,
  TWILIO_PHONE_NUMBER: optionalString,
  RESEND_API_KEY: optionalString,
  FROM_EMAIL: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .pipe(z.string().email().optional()),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }
  return parsed.data;
}

export const env = parseEnv();

export function getAuthBaseUrl() {
  return env.BETTER_AUTH_URL ?? env.NEXT_PUBLIC_APP_URL;
}

export function isGoogleOAuthEnabled() {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
}

export function isAppleOAuthEnabled() {
  return Boolean(env.APPLE_CLIENT_ID && env.APPLE_CLIENT_SECRET);
}
