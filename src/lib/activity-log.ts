import { prisma } from "@/lib/prisma";
import type { ActivityLogInput } from "@/types";

/**
 * Records an admin activity event (create/update/delete/login, etc.) for auditing.
 * Never throws — logging failures should not break the primary operation.
 */
export async function logActivity(input: ActivityLogInput): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        details: input.details ? (input.details as never) : undefined,
      },
    });
  } catch (error) {
    console.error("[activity-log] Failed to record activity:", error);
  }
}

export interface ActivityLogQuery {
  entity?: string;
  entityId?: string;
  userId?: string;
  page?: number;
  pageSize?: number;
}

/** Fetch recent activity log entries, most recent first, with basic filtering + pagination. */
export async function getActivityLogs(query: ActivityLogQuery = {}) {
  const page = query.page && query.page > 0 ? query.page : 1;
  const pageSize = query.pageSize && query.pageSize > 0 ? query.pageSize : 25;

  const where = {
    ...(query.entity ? { entity: query.entity } : {}),
    ...(query.entityId ? { entityId: query.entityId } : {}),
    ...(query.userId ? { userId: query.userId } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.activityLog.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
