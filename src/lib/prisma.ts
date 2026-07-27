import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

/** Tune Prisma pool for Supabase transaction mode (pgbouncer). */
function pooledDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    const isProdBuild = process.env.NEXT_PHASE === "phase-production-build";
    const limit = process.env.PRISMA_CONNECTION_LIMIT || (isProdBuild ? "5" : "3");

    url.searchParams.set("connection_limit", limit);
    if (!url.searchParams.has("pool_timeout")) {
      url.searchParams.set("pool_timeout", isProdBuild ? "30" : "20");
    }
    if (url.port === "6543" && !url.searchParams.has("pgbouncer")) {
      url.searchParams.set("pgbouncer", "true");
    }
    return url.toString();
  } catch {
    return raw;
  }
}

function createPrismaClient() {
  const url = pooledDatabaseUrl();
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    ...(url ? { datasources: { db: { url } } } : {}),
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = prisma;
