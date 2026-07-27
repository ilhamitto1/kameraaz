"use server";

import { requireAdmin } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { newId, nowIso, serializeRow } from "@/lib/supabase/utils";
import { logActivity } from "@/lib/activity-log";
import { categorySchema } from "@/lib/validations/category";
import { brandSchema } from "@/lib/validations/brand";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

async function getActiveProductCounts(field: "categoryId" | "brandId") {
  const sb = getAdminClient();
  const { data: products } = await sb
    .from("Product")
    .select(field)
    .is("deletedAt", null)
    .eq("isActive", true);

  const counts = new Map<string, number>();
  for (const product of products || []) {
    const id = (product as Record<"categoryId" | "brandId", string | null>)[field];
    if (!id) continue;
    counts.set(id, (counts.get(id) || 0) + 1);
  }
  return counts;
}

function withProductCount<T extends { id: string }>(rows: T[], counts: Map<string, number>) {
  return rows.map((row) =>
    serializeRow({
      ...row,
      _count: { products: counts.get(row.id) || 0 },
    }),
  );
}

export async function getCategories(opts?: { admin?: boolean }) {
  const sb = getAdminClient();
  let query = sb.from("Category").select("*").is("deletedAt", null).order("sortOrder", { ascending: true });
  if (!opts?.admin) {
    query = query.eq("isVisible", true);
  }

  const [{ data: categories }, counts] = await Promise.all([
    query,
    getActiveProductCounts("categoryId"),
  ]);

  return withProductCount(categories || [], counts);
}

export async function getCategoryBySlug(slug: string) {
  const sb = getAdminClient();
  const [{ data: category }, counts] = await Promise.all([
    sb
      .from("Category")
      .select("*")
      .eq("slug", slug)
      .is("deletedAt", null)
      .eq("isVisible", true)
      .maybeSingle(),
    getActiveProductCounts("categoryId"),
  ]);

  if (!category) return null;
  return serializeRow({
    ...category,
    _count: { products: counts.get(category.id) || 0 },
  });
}

export async function createCategory(raw: unknown) {
  const user = await requireAdmin();
  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: "Validation", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;
  const slug = data.slug || slugify(data.name);
  const now = nowIso();
  const sb = getAdminClient();
  const row = {
    id: newId(),
    name: data.name,
    slug,
    description: data.description || null,
    image: data.image || null,
    icon: data.icon || null,
    sortOrder: data.sortOrder,
    isVisible: data.isVisible,
    showInNav: data.showInNav,
    createdAt: now,
    updatedAt: now,
  };

  const { data: cat, error } = await sb.from("Category").insert(row).select().single();
  if (error) return { success: false as const, error: error.message };

  await logActivity({ userId: user.id, action: "CREATE", entity: "Category", entityId: cat.id });
  revalidatePath("/");
  revalidatePath("/admin/kateqoriyalar");
  return { success: true as const, data: serializeRow(cat) };
}

export async function updateCategory(id: string, raw: unknown) {
  const user = await requireAdmin();
  const parsed = categorySchema.partial().safeParse(raw);
  if (!parsed.success) return { success: false as const, error: "Validation" };
  const data = parsed.data;
  const sb = getAdminClient();
  const { error } = await sb
    .from("Category")
    .update({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description || null }),
      ...(data.image !== undefined && { image: data.image || null }),
      ...(data.icon !== undefined && { icon: data.icon || null }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      ...(data.isVisible !== undefined && { isVisible: data.isVisible }),
      ...(data.showInNav !== undefined && { showInNav: data.showInNav }),
      updatedAt: nowIso(),
    })
    .eq("id", id);
  if (error) return { success: false as const, error: error.message };

  await logActivity({ userId: user.id, action: "UPDATE", entity: "Category", entityId: id });
  revalidatePath("/");
  revalidatePath("/admin/kateqoriyalar");
  return { success: true as const };
}

export async function deleteCategory(id: string) {
  const user = await requireAdmin();
  const sb = getAdminClient();
  const { count } = await sb
    .from("Product")
    .select("*", { count: "exact", head: true })
    .eq("categoryId", id)
    .is("deletedAt", null);
  if ((count || 0) > 0) return { success: false as const, error: "Kateqoriyada məhsul var" };

  const { data: existing } = await sb
    .from("Category")
    .select("slug")
    .eq("id", id)
    .is("deletedAt", null)
    .maybeSingle();

  const { error } = await sb
    .from("Category")
    .update({
      deletedAt: nowIso(),
      isVisible: false,
      slug: existing ? `${existing.slug}-deleted-${Date.now()}` : undefined,
      updatedAt: nowIso(),
    })
    .eq("id", id);
  if (error) return { success: false as const, error: error.message };

  await logActivity({ userId: user.id, action: "DELETE", entity: "Category", entityId: id });
  revalidatePath("/admin/kateqoriyalar");
  return { success: true as const };
}

export async function reorderCategories(orderedIds: string[]) {
  const user = await requireAdmin();
  const sb = getAdminClient();
  const now = nowIso();
  await Promise.all(
    orderedIds.map((id, i) =>
      sb.from("Category").update({ sortOrder: i, updatedAt: now }).eq("id", id),
    ),
  );
  await logActivity({ userId: user.id, action: "REORDER", entity: "Category" });
  revalidatePath("/");
  return { success: true as const };
}

export async function getBrands(opts?: { admin?: boolean }) {
  const sb = getAdminClient();
  let query = sb.from("Brand").select("*").is("deletedAt", null).order("name", { ascending: true });
  if (!opts?.admin) {
    query = query.eq("isActive", true);
  }

  const [{ data: brands }, counts] = await Promise.all([query, getActiveProductCounts("brandId")]);
  return withProductCount(brands || [], counts);
}

export async function createBrand(raw: unknown) {
  const user = await requireAdmin();
  const parsed = brandSchema.safeParse(raw);
  if (!parsed.success) return { success: false as const, error: "Validation" };
  const data = parsed.data;
  const slug = data.slug || slugify(data.name);
  const now = nowIso();
  const sb = getAdminClient();
  const row = {
    id: newId(),
    name: data.name,
    slug,
    logo: data.logo || null,
    isActive: data.isActive,
    createdAt: now,
    updatedAt: now,
  };

  const { data: brand, error } = await sb.from("Brand").insert(row).select().single();
  if (error) return { success: false as const, error: error.message };

  await logActivity({ userId: user.id, action: "CREATE", entity: "Brand", entityId: brand.id });
  revalidatePath("/admin/markalar");
  return { success: true as const, data: serializeRow(brand) };
}

export async function updateBrand(id: string, raw: unknown) {
  const user = await requireAdmin();
  const parsed = brandSchema.partial().safeParse(raw);
  if (!parsed.success) return { success: false as const, error: "Validation" };
  const data = parsed.data;
  const sb = getAdminClient();
  const { error } = await sb
    .from("Brand")
    .update({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.logo !== undefined && { logo: data.logo || null }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      updatedAt: nowIso(),
    })
    .eq("id", id);
  if (error) return { success: false as const, error: error.message };

  await logActivity({ userId: user.id, action: "UPDATE", entity: "Brand", entityId: id });
  revalidatePath("/admin/markalar");
  return { success: true as const };
}

export async function deleteBrand(id: string) {
  const user = await requireAdmin();
  const sb = getAdminClient();
  const { count } = await sb
    .from("Product")
    .select("*", { count: "exact", head: true })
    .eq("brandId", id)
    .is("deletedAt", null);
  if ((count || 0) > 0) return { success: false as const, error: "Markaya bağlı məhsul var" };

  const { data: existing } = await sb
    .from("Brand")
    .select("slug, name")
    .eq("id", id)
    .is("deletedAt", null)
    .maybeSingle();

  const stamp = Date.now();
  const { error } = await sb
    .from("Brand")
    .update({
      deletedAt: nowIso(),
      isActive: false,
      slug: existing ? `${existing.slug}-deleted-${stamp}` : undefined,
      name: existing ? `${existing.name} (silinib ${stamp})` : undefined,
      updatedAt: nowIso(),
    })
    .eq("id", id);
  if (error) return { success: false as const, error: error.message };

  await logActivity({ userId: user.id, action: "DELETE", entity: "Brand", entityId: id });
  revalidatePath("/admin/markalar");
  return { success: true as const };
}
