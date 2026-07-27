import { getAdminClient } from "@/lib/supabase/admin";
import { newId } from "@/lib/supabase/utils";
import type { ActivityLogInput } from "@/types";

export async function logActivity(input: ActivityLogInput): Promise<void> {
  try {
    const sb = getAdminClient();
    await sb.from("ActivityLog").insert({
      id: newId(),
      userId: input.userId ?? null,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? null,
      details: input.details ?? null,
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

export async function getActivityLogs(query: ActivityLogQuery = {}) {
  const page = query.page && query.page > 0 ? query.page : 1;
  const pageSize = query.pageSize && query.pageSize > 0 ? query.pageSize : 25;
  const sb = getAdminClient();

  let q = sb
    .from("ActivityLog")
    .select("*", { count: "exact" })
    .order("createdAt", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (query.entity) q = q.eq("entity", query.entity);
  if (query.entityId) q = q.eq("entityId", query.entityId);
  if (query.userId) q = q.eq("userId", query.userId);

  const { data: items, count } = await q;
  const total = count || 0;

  return {
    items: items || [],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
