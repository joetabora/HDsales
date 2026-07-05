// Prisma 7 config — DATABASE_URL is only required at runtime/migrate time.
// `prisma generate` does not connect to the DB, so we use a placeholder during CI/Vercel install.
import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://forge:forge@localhost:5432/forge?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
