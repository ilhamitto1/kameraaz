"use server";

import { requireAdmin } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { newId, nowIso, serializeRow } from "@/lib/supabase/utils";
import { logActivity } from "@/lib/activity-log";
import { contactSchema } from "@/lib/validations/contact";
import { bookingDateSchema } from "@/lib/validations/booking";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getSettings, updateSettings as saveSettings, DEFAULT_SETTINGS } from "@/lib/settings";
import { settingsSchema } from "@/lib/validations/settings";
import type { MessageStatus } from "@/types/database";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

function clientIpFromHeaders(h: Headers): string {
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return h.get("x-real-ip")?.trim() || "unknown";
}

type ActivityLogRow = {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  details: unknown;
  createdAt: string;
};

async function attachProfiles(logs: ActivityLogRow[]) {
  const userIds = [...new Set(logs.map((log) => log.userId).filter(Boolean))] as string[];
  if (!userIds.length) {
    return logs.map((log) => ({ ...serializeRow(log), user: null }));
  }

  const sb = getAdminClient();
  const { data: profiles } = await sb.from("profiles").select("id, email, name").in("id", userIds);
  const byId = new Map((profiles || []).map((profile) => [profile.id, profile]));

  return logs.map((log) => ({
    ...serializeRow(log),
    user:
      log.userId && byId.has(log.userId)
        ? { name: byId.get(log.userId)!.name, email: byId.get(log.userId)!.email }
        : null,
  }));
}

export async function submitContactForm(raw: unknown) {
  const h = await headers();
  const ip = clientIpFromHeaders(h);
  const limit = checkRateLimit(`contact:${ip}`, RATE_LIMITS.contactForm);
  if (!limit.success) {
    return { success: false as const, error: "Çox sayda cəhd. Bir az sonra yenidən cəhd edin." };
  }

  const data = raw as Record<string, unknown>;
  if (data.website || data.honeypot) return { success: true as const };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: "Formada xəta var", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const now = nowIso();
  const sb = getAdminClient();
  const { error } = await sb.from("ContactMessage").insert({
    id: newId(),
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    subject: parsed.data.subject || null,
    message: parsed.data.message,
    status: "NEW",
    createdAt: now,
    updatedAt: now,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/mesajlar");
  return { success: true as const };
}

export async function getMessages(status?: MessageStatus) {
  await requireAdmin();
  const sb = getAdminClient();
  let query = sb
    .from("ContactMessage")
    .select("*")
    .is("deletedAt", null)
    .order("createdAt", { ascending: false });
  if (status) {
    query = query.eq("status", status);
  }

  const { data } = await query;
  return (data || []).map((row) => serializeRow(row));
}

export async function updateMessageStatus(id: string, status: MessageStatus) {
  const user = await requireAdmin();
  const sb = getAdminClient();
  const { error } = await sb
    .from("ContactMessage")
    .update({ status, updatedAt: nowIso() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await logActivity({
    userId: user.id,
    action: "UPDATE_STATUS",
    entity: "ContactMessage",
    entityId: id,
    details: { status },
  });
  revalidatePath("/admin/mesajlar");
  return { success: true as const };
}

export async function deleteMessage(id: string) {
  const user = await requireAdmin();
  const sb = getAdminClient();
  const { error } = await sb
    .from("ContactMessage")
    .update({ deletedAt: nowIso(), updatedAt: nowIso() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await logActivity({ userId: user.id, action: "DELETE", entity: "ContactMessage", entityId: id });
  revalidatePath("/admin/mesajlar");
  return { success: true as const };
}

export async function getBookings(productId?: string) {
  await requireAdmin();
  const sb = getAdminClient();
  let query = sb
    .from("BookingDate")
    .select("*, product:Product(id, name, slug)")
    .order("startDate", { ascending: true });
  if (productId) {
    query = query.eq("productId", productId);
  }

  const { data } = await query;
  return (data || []).map((row) => serializeRow(row));
}

export async function createBooking(raw: unknown) {
  const user = await requireAdmin();
  const parsed = bookingDateSchema.safeParse(raw);
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)
      .flat()
      .filter(Boolean)[0];
    return { success: false as const, error: first || parsed.error.issues[0]?.message || "Validation" };
  }

  const now = nowIso();
  const sb = getAdminClient();
  const row = {
    id: newId(),
    productId: parsed.data.productId,
    startDate: parsed.data.startDate.toISOString().slice(0, 10),
    endDate: parsed.data.endDate.toISOString().slice(0, 10),
    note: parsed.data.note || null,
    createdAt: now,
    updatedAt: now,
  };

  const { data: booking, error } = await sb.from("BookingDate").insert(row).select().single();
  if (error) throw new Error(error.message);

  await logActivity({ userId: user.id, action: "CREATE", entity: "BookingDate", entityId: booking.id });
  revalidatePath("/admin/rezervasiyalar");
  return { success: true as const, data: serializeRow(booking) };
}

export async function deleteBooking(id: string) {
  const user = await requireAdmin();
  const sb = getAdminClient();
  const { error } = await sb.from("BookingDate").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await logActivity({ userId: user.id, action: "DELETE", entity: "BookingDate", entityId: id });
  revalidatePath("/admin/rezervasiyalar");
  return { success: true as const };
}

export async function getPublicSettings() {
  return getSettings();
}

export async function updateSiteSettings(raw: unknown) {
  const user = await requireAdmin();
  const parsed = settingsSchema.partial().safeParse(raw);
  if (!parsed.success) return { success: false as const, error: "Validation" };
  try {
    await saveSettings(parsed.data as Partial<typeof DEFAULT_SETTINGS>);
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Parametrlər saxlanılmadı",
    };
  }
  await logActivity({
    userId: user.id,
    action: "UPDATE",
    entity: "SiteSetting",
    details: parsed.data as never,
  });
  revalidatePath("/");
  revalidatePath("/admin/parametrler");
  return { success: true as const };
}

export async function getNavigation() {
  const sb = getAdminClient();
  const { data } = await sb
    .from("NavigationItem")
    .select("*")
    .eq("isVisible", true)
    .order("sortOrder", { ascending: true });
  return (data || []).map((row) => serializeRow(row));
}

export async function updateNavigation(
  items: { id?: string; label: string; href: string; sortOrder: number; isVisible: boolean }[],
) {
  const user = await requireAdmin();
  const sb = getAdminClient();
  const now = nowIso();

  const { error: deleteError } = await sb.from("NavigationItem").delete().not("id", "is", null);
  if (deleteError) throw new Error(deleteError.message);

  if (items.length) {
    const { error: insertError } = await sb.from("NavigationItem").insert(
      items.map((item, i) => ({
        id: newId(),
        label: item.label,
        href: item.href,
        sortOrder: item.sortOrder ?? i,
        isVisible: item.isVisible,
        createdAt: now,
        updatedAt: now,
      })),
    );
    if (insertError) throw new Error(insertError.message);
  }

  await logActivity({ userId: user.id, action: "UPDATE", entity: "NavigationItem" });
  revalidatePath("/");
  return { success: true as const };
}

export async function getDashboardStats() {
  await requireAdmin();
  const sb = getAdminClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const [
    totalProductsRes,
    activeProductsRes,
    availableProductsRes,
    rentedProductsRes,
    categoryCountRes,
    recentProductsRes,
    topViewedRes,
    topWhatsappRes,
    recentMessagesRes,
    recentActivityRes,
    viewsLast7Res,
    clicksLast7Res,
  ] = await Promise.all([
    sb.from("Product").select("*", { count: "exact", head: true }).is("deletedAt", null),
    sb.from("Product").select("*", { count: "exact", head: true }).is("deletedAt", null).eq("isActive", true),
    sb
      .from("Product")
      .select("*", { count: "exact", head: true })
      .is("deletedAt", null)
      .eq("status", "AVAILABLE"),
    sb.from("Product").select("*", { count: "exact", head: true }).is("deletedAt", null).eq("status", "RENTED"),
    sb.from("Category").select("*", { count: "exact", head: true }).is("deletedAt", null),
    sb
      .from("Product")
      .select("id, name, slug, createdAt, mainImage")
      .is("deletedAt", null)
      .order("createdAt", { ascending: false })
      .limit(5),
    sb
      .from("Product")
      .select("id, name, viewCount, slug")
      .is("deletedAt", null)
      .order("viewCount", { ascending: false })
      .limit(5),
    sb
      .from("Product")
      .select("id, name, whatsappClicks, slug")
      .is("deletedAt", null)
      .order("whatsappClicks", { ascending: false })
      .limit(5),
    sb
      .from("ContactMessage")
      .select("*")
      .is("deletedAt", null)
      .order("createdAt", { ascending: false })
      .limit(5),
    sb.from("ActivityLog").select("*").order("createdAt", { ascending: false }).limit(10),
    sb
      .from("ProductView")
      .select("*", { count: "exact", head: true })
      .gte("createdAt", sevenDaysAgo),
    sb.from("WhatsAppClick").select("*", { count: "exact", head: true }).gte("createdAt", sevenDaysAgo),
  ]);

  const recentActivity = await attachProfiles((recentActivityRes.data || []) as ActivityLogRow[]);

  return {
    totalProducts: totalProductsRes.count || 0,
    activeProducts: activeProductsRes.count || 0,
    availableProducts: availableProductsRes.count || 0,
    rentedProducts: rentedProductsRes.count || 0,
    categoryCount: categoryCountRes.count || 0,
    recentProducts: (recentProductsRes.data || []).map((row) => serializeRow(row)),
    topViewed: (topViewedRes.data || []).map((row) => serializeRow(row)),
    topWhatsapp: (topWhatsappRes.data || []).map((row) => serializeRow(row)),
    recentMessages: (recentMessagesRes.data || []).map((row) => serializeRow(row)),
    recentActivity,
    viewsLast7Count: viewsLast7Res.count || 0,
    clicksLast7: clicksLast7Res.count || 0,
  };
}

export async function getActivityLogs(page = 1, pageSize = 30) {
  await requireAdmin();
  const sb = getAdminClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: items, count } = await sb
    .from("ActivityLog")
    .select("*", { count: "exact" })
    .order("createdAt", { ascending: false })
    .range(from, to);

  const total = count || 0;
  const withUsers = await attachProfiles((items || []) as ActivityLogRow[]);

  return {
    items: withUsers,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export { getSettings };
