"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-log";
import { contactSchema } from "@/lib/validations/contact";
import { bookingDateSchema } from "@/lib/validations/booking";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getSettings, updateSettings as saveSettings, DEFAULT_SETTINGS } from "@/lib/settings";
import { settingsSchema } from "@/lib/validations/settings";
import { MessageStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user;
}

function clientIpFromHeaders(h: Headers): string {
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return h.get("x-real-ip")?.trim() || "unknown";
}

export async function submitContactForm(raw: unknown) {
  const h = await headers();
  const ip = clientIpFromHeaders(h);
  const limit = checkRateLimit(`contact:${ip}`, RATE_LIMITS.contactForm);
  if (!limit.success) {
    return { success: false as const, error: "Çox sayda cəhd. Bir az sonra yenidən cəhd edin." };
  }

  const data = raw as Record<string, unknown>;
  if (data.website || data.honeypot) return { success: true as const }; // honeypot

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: "Formada xəta var", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.contactMessage.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject || null,
      message: parsed.data.message,
    },
  });
  revalidatePath("/admin/mesajlar");
  return { success: true as const };
}

export async function getMessages(status?: MessageStatus) {
  await requireAdmin();
  return prisma.contactMessage.findMany({
    where: { deletedAt: null, ...(status ? { status } : {}) },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateMessageStatus(id: string, status: MessageStatus) {
  const user = await requireAdmin();
  await prisma.contactMessage.update({ where: { id }, data: { status } });
  await logActivity({ userId: user.id, action: "UPDATE_STATUS", entity: "ContactMessage", entityId: id, details: { status } });
  revalidatePath("/admin/mesajlar");
  return { success: true as const };
}

export async function deleteMessage(id: string) {
  const user = await requireAdmin();
  await prisma.contactMessage.update({ where: { id }, data: { deletedAt: new Date() } });
  await logActivity({ userId: user.id, action: "DELETE", entity: "ContactMessage", entityId: id });
  revalidatePath("/admin/mesajlar");
  return { success: true as const };
}

export async function getBookings(productId?: string) {
  await requireAdmin();
  return prisma.bookingDate.findMany({
    where: productId ? { productId } : undefined,
    include: { product: { select: { id: true, name: true, slug: true } } },
    orderBy: { startDate: "asc" },
  });
}

export async function createBooking(raw: unknown) {
  const user = await requireAdmin();
  const parsed = bookingDateSchema.safeParse(raw);
  if (!parsed.success) return { success: false as const, error: "Validation" };
  const booking = await prisma.bookingDate.create({
    data: {
      productId: parsed.data.productId,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      note: parsed.data.note || null,
    },
  });
  await logActivity({ userId: user.id, action: "CREATE", entity: "BookingDate", entityId: booking.id });
  revalidatePath("/admin/rezervasiyalar");
  return { success: true as const, data: booking };
}

export async function deleteBooking(id: string) {
  const user = await requireAdmin();
  await prisma.bookingDate.delete({ where: { id } });
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
  await saveSettings(parsed.data as Partial<typeof DEFAULT_SETTINGS>);
  await logActivity({ userId: user.id, action: "UPDATE", entity: "SiteSetting", details: parsed.data as never });
  revalidatePath("/");
  revalidatePath("/admin/parametrler");
  return { success: true as const };
}

export async function getNavigation() {
  return prisma.navigationItem.findMany({
    where: { isVisible: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function updateNavigation(items: { id?: string; label: string; href: string; sortOrder: number; isVisible: boolean }[]) {
  const user = await requireAdmin();
  await prisma.navigationItem.deleteMany();
  await prisma.navigationItem.createMany({
    data: items.map((item, i) => ({
      label: item.label,
      href: item.href,
      sortOrder: item.sortOrder ?? i,
      isVisible: item.isVisible,
    })),
  });
  await logActivity({ userId: user.id, action: "UPDATE", entity: "NavigationItem" });
  revalidatePath("/");
  return { success: true as const };
}

export async function getDashboardStats() {
  await requireAdmin();
  const [
    totalProducts,
    activeProducts,
    availableProducts,
    rentedProducts,
    categoryCount,
    recentProducts,
    topViewed,
    topWhatsapp,
    recentMessages,
    recentActivity,
    viewsLast7,
    clicksLast7,
  ] = await Promise.all([
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { deletedAt: null, isActive: true } }),
    prisma.product.count({ where: { deletedAt: null, status: "AVAILABLE" } }),
    prisma.product.count({ where: { deletedAt: null, status: "RENTED" } }),
    prisma.category.count({ where: { deletedAt: null } }),
    prisma.product.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, slug: true, createdAt: true, mainImage: true },
    }),
    prisma.product.findMany({
      where: { deletedAt: null },
      orderBy: { viewCount: "desc" },
      take: 5,
      select: { id: true, name: true, viewCount: true, slug: true },
    }),
    prisma.product.findMany({
      where: { deletedAt: null },
      orderBy: { whatsappClicks: "desc" },
      take: 5,
      select: { id: true, name: true, whatsappClicks: true, slug: true },
    }),
    prisma.contactMessage.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.productView.groupBy({
      by: ["createdAt"],
      _count: true,
      where: { createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
    }),
    prisma.whatsAppClick.count({
      where: { createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
    }),
  ]);

  return {
    totalProducts,
    activeProducts,
    availableProducts,
    rentedProducts,
    categoryCount,
    recentProducts,
    topViewed,
    topWhatsapp,
    recentMessages,
    recentActivity,
    viewsLast7Count: viewsLast7.reduce((a, b) => a + b._count, 0),
    clicksLast7,
  };
}

export async function getActivityLogs(page = 1, pageSize = 30) {
  await requireAdmin();
  const [total, items] = await Promise.all([
    prisma.activityLog.count(),
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);
  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export { getSettings };
