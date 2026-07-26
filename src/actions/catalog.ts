"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-log";
import { categorySchema } from "@/lib/validations/category";
import { brandSchema } from "@/lib/validations/brand";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user;
}

export async function getCategories(opts?: { admin?: boolean }) {
  return prisma.category.findMany({
    where: {
      deletedAt: null,
      ...(opts?.admin ? {} : { isVisible: true }),
    },
    include: {
      _count: { select: { products: { where: { deletedAt: null, isActive: true } } } },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findFirst({
    where: { slug, deletedAt: null, isVisible: true },
    include: {
      _count: { select: { products: { where: { deletedAt: null, isActive: true } } } },
    },
  });
}

export async function createCategory(raw: unknown) {
  const user = await requireAdmin();
  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) return { success: false as const, error: "Validation", fieldErrors: parsed.error.flatten().fieldErrors };
  const data = parsed.data;
  const slug = data.slug || slugify(data.name);
  const cat = await prisma.category.create({
    data: {
      name: data.name,
      slug,
      description: data.description || null,
      image: data.image || null,
      icon: data.icon || null,
      sortOrder: data.sortOrder,
      isVisible: data.isVisible,
      showInNav: data.showInNav,
    },
  });
  await logActivity({ userId: user.id, action: "CREATE", entity: "Category", entityId: cat.id });
  revalidatePath("/");
  revalidatePath("/admin/kateqoriyalar");
  return { success: true as const, data: cat };
}

export async function updateCategory(id: string, raw: unknown) {
  const user = await requireAdmin();
  const parsed = categorySchema.partial().safeParse(raw);
  if (!parsed.success) return { success: false as const, error: "Validation" };
  const data = parsed.data;
  await prisma.category.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description || null }),
      ...(data.image !== undefined && { image: data.image || null }),
      ...(data.icon !== undefined && { icon: data.icon || null }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      ...(data.isVisible !== undefined && { isVisible: data.isVisible }),
      ...(data.showInNav !== undefined && { showInNav: data.showInNav }),
    },
  });
  await logActivity({ userId: user.id, action: "UPDATE", entity: "Category", entityId: id });
  revalidatePath("/");
  revalidatePath("/admin/kateqoriyalar");
  return { success: true as const };
}

export async function deleteCategory(id: string) {
  const user = await requireAdmin();
  const count = await prisma.product.count({ where: { categoryId: id, deletedAt: null } });
  if (count > 0) return { success: false as const, error: "Kateqoriyada məhsul var" };
  await prisma.category.update({ where: { id }, data: { deletedAt: new Date(), isVisible: false } });
  await logActivity({ userId: user.id, action: "DELETE", entity: "Category", entityId: id });
  revalidatePath("/admin/kateqoriyalar");
  return { success: true as const };
}

export async function reorderCategories(orderedIds: string[]) {
  const user = await requireAdmin();
  await Promise.all(orderedIds.map((id, i) => prisma.category.update({ where: { id }, data: { sortOrder: i } })));
  await logActivity({ userId: user.id, action: "REORDER", entity: "Category" });
  revalidatePath("/");
  return { success: true as const };
}

export async function getBrands(opts?: { admin?: boolean }) {
  return prisma.brand.findMany({
    where: { deletedAt: null, ...(opts?.admin ? {} : { isActive: true }) },
    include: { _count: { select: { products: { where: { deletedAt: null, isActive: true } } } } },
    orderBy: { name: "asc" },
  });
}

export async function createBrand(raw: unknown) {
  const user = await requireAdmin();
  const parsed = brandSchema.safeParse(raw);
  if (!parsed.success) return { success: false as const, error: "Validation" };
  const data = parsed.data;
  const slug = data.slug || slugify(data.name);
  const brand = await prisma.brand.create({
    data: { name: data.name, slug, logo: data.logo || null, isActive: data.isActive },
  });
  await logActivity({ userId: user.id, action: "CREATE", entity: "Brand", entityId: brand.id });
  revalidatePath("/admin/markalar");
  return { success: true as const, data: brand };
}

export async function updateBrand(id: string, raw: unknown) {
  const user = await requireAdmin();
  const parsed = brandSchema.partial().safeParse(raw);
  if (!parsed.success) return { success: false as const, error: "Validation" };
  const data = parsed.data;
  await prisma.brand.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.logo !== undefined && { logo: data.logo || null }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
  await logActivity({ userId: user.id, action: "UPDATE", entity: "Brand", entityId: id });
  revalidatePath("/admin/markalar");
  return { success: true as const };
}

export async function deleteBrand(id: string) {
  const user = await requireAdmin();
  const count = await prisma.product.count({ where: { brandId: id, deletedAt: null } });
  if (count > 0) return { success: false as const, error: "Markaya bağlı məhsul var" };
  await prisma.brand.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  await logActivity({ userId: user.id, action: "DELETE", entity: "Brand", entityId: id });
  revalidatePath("/admin/markalar");
  return { success: true as const };
}
