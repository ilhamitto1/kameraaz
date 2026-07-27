"use server";

import { requireAdmin } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { newId, nowIso, serializeRow } from "@/lib/supabase/utils";
import { logActivity } from "@/lib/activity-log";
import { productSchema } from "@/lib/validations/product";
import { slugify } from "@/lib/utils";
import type { AvailabilityStatus, PriceType } from "@/types/database";
import { revalidatePath, revalidateTag } from "next/cache";

const PRODUCT_LIST_SELECT =
  "*, brand:Brand(*), category:Category(*), images:ProductImage(*), specifications:Specification(*)";

const PRODUCT_DETAIL_SELECT = `
  *,
  brand:Brand(*),
  category:Category(*),
  images:ProductImage(*),
  specifications:Specification(*),
  bookingDates:BookingDate(*),
  accessories:ProductAccessory(
    *,
    accessory:Product(
      *,
      brand:Brand(*),
      category:Category(*),
      images:ProductImage(*)
    )
  ),
  relatedFrom:RelatedProduct(
    *,
    relatedProduct:Product(
      *,
      brand:Brand(*),
      category:Category(*),
      images:ProductImage(*)
    )
  )
`;

function serializeProduct(p: Record<string, unknown>) {
  return serializeRow(p) as Record<string, unknown>;
}

function sortBySortOrder<T extends { sortOrder?: number | null }>(items: T[] | null | undefined): T[] {
  return [...(items || [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

function normalizeListProduct(row: Record<string, unknown>) {
  const p = serializeProduct(row);
  if (Array.isArray(p.images)) p.images = sortBySortOrder(p.images as { sortOrder?: number | null }[]);
  if (Array.isArray(p.specifications)) {
    p.specifications = sortBySortOrder(p.specifications as { sortOrder?: number | null }[]);
  }
  return p;
}

function normalizeDetailProduct(row: Record<string, unknown>) {
  const p = normalizeListProduct(row);
  if (Array.isArray(p.bookingDates)) {
    p.bookingDates = [...(p.bookingDates as { startDate?: string }[])].sort((a, b) =>
      (a.startDate || "").localeCompare(b.startDate || ""),
    );
  }
  return p;
}

type ProductFilters = {
  categorySlug?: string;
  brandSlug?: string;
  status?: AvailabilityStatus;
  isFeatured?: boolean;
  isNew?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  pageSize?: number;
  admin?: boolean;
};

function buildListSelect(filters: ProductFilters) {
  const categoryJoin = filters.categorySlug ? "category:Category!inner(*)" : "category:Category(*)";
  const brandJoin = filters.brandSlug ? "brand:Brand!inner(*)" : "brand:Brand(*)";
  return `*, ${brandJoin}, ${categoryJoin}, images:ProductImage(*), specifications:Specification(*)`;
}

async function resolveSearchBrandIds(search?: string): Promise<string[]> {
  if (!search?.trim()) return [];
  const term = `%${search.trim()}%`;
  const sb = getAdminClient();
  const { data: brandMatches } = await sb
    .from("Brand")
    .select("id")
    .ilike("name", term)
    .is("deletedAt", null);
  return (brandMatches || []).map((b) => b.id as string);
}

function applyProductFilters(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  baseQuery: any,
  filters: ProductFilters,
  searchBrandIds: string[] = [],
) {
  // Never await the builder — Supabase thenables execute on await.
  let query = baseQuery.is("deletedAt", null);

  if (!filters.admin) {
    query = query.eq("isActive", true).is("archivedAt", null);
  }
  if (filters.categorySlug) {
    query = query.eq("category.slug", filters.categorySlug).is("category.deletedAt", null);
  }
  if (filters.brandSlug) {
    query = query.eq("brand.slug", filters.brandSlug).is("brand.deletedAt", null);
  }
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.isFeatured) query = query.eq("isFeatured", true);
  if (filters.isNew) query = query.eq("isNew", true);
  if (filters.minPrice !== undefined) query = query.gte("dailyPrice", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("dailyPrice", filters.maxPrice);

  if (filters.search) {
    const term = `%${filters.search.trim()}%`;
    const orParts = [`name.ilike.${term}`, `shortDesc.ilike.${term}`];
    if (searchBrandIds.length) {
      orParts.push(`brandId.in.(${searchBrandIds.join(",")})`);
    }
    query = query.or(orParts.join(","));
  }

  return query;
}

function applyProductSort(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  sort?: string,
) {
  switch (sort) {
    case "newest":
      return query.order("createdAt", { ascending: false });
    case "price-asc":
      return query.order("dailyPrice", { ascending: true });
    case "price-desc":
      return query.order("dailyPrice", { ascending: false });
    case "popular":
      return query.order("viewCount", { ascending: false });
    case "recommended":
      return query.order("isFeatured", { ascending: false });
    default:
      return query.order("sortOrder", { ascending: true });
  }
}

export async function getProducts(filters: ProductFilters) {
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 12;
  const sb = getAdminClient();
  const select = buildListSelect(filters);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const searchBrandIds = await resolveSearchBrandIds(filters.search);

  const countQuery = applyProductFilters(
    sb.from("Product").select(select, { count: "exact", head: true }),
    filters,
    searchBrandIds,
  );
  const dataQuery = applyProductSort(
    applyProductFilters(sb.from("Product").select(select), filters, searchBrandIds),
    filters.sort,
  ).range(from, to);

  const [{ count }, { data, error }] = await Promise.all([countQuery, dataQuery]);
  if (error) throw error;

  const total = count || 0;
  const items = ((data || []) as unknown as Record<string, unknown>[]).map((p) =>
    normalizeListProduct(p),
  );

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getProductBySlug(slug: string) {
  const sb = getAdminClient();
  const { data: product, error } = await sb
    .from("Product")
    .select(PRODUCT_DETAIL_SELECT)
    .eq("slug", slug)
    .is("deletedAt", null)
    .eq("isActive", true)
    .maybeSingle();

  if (error) throw error;
  if (!product) return null;
  return normalizeDetailProduct(product as unknown as Record<string, unknown>);
}

export async function getProductPickerList(excludeId?: string) {
  await requireAdmin();
  const sb = getAdminClient();
  let query = sb
    .from("Product")
    .select("id, name, category:Category(name, sortOrder)")
    .is("deletedAt", null)
    .limit(500);

  if (excludeId) query = query.neq("id", excludeId);

  const { data, error } = await query;
  if (error) throw error;

  return [...(data || [])]
    .sort((a, b) => {
      const catA = a.category as { sortOrder?: number; name?: string } | null;
      const catB = b.category as { sortOrder?: number; name?: string } | null;
      const orderA = catA?.sortOrder ?? 0;
      const orderB = catB?.sortOrder ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    })
    .map((p) => ({
      id: p.id,
      name: p.name,
      categoryName: (p.category as { name?: string } | null)?.name || "—",
    }));
}

export async function getProductById(id: string) {
  await requireAdmin();
  const sb = getAdminClient();
  const { data: product, error } = await sb
    .from("Product")
    .select(
      `${PRODUCT_LIST_SELECT}, accessories:ProductAccessory(*), relatedFrom:RelatedProduct(*), bookingDates:BookingDate(*)`,
    )
    .eq("id", id)
    .is("deletedAt", null)
    .maybeSingle();

  if (error) throw error;
  if (!product) return null;
  return normalizeDetailProduct(product as unknown as Record<string, unknown>);
}

export async function createProduct(raw: unknown) {
  const user = await requireAdmin();
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)
      .flat()
      .filter(Boolean)[0];
    return {
      success: false as const,
      error: first || "Məlumatlar düzgün deyil",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;
  const slug = data.slug || slugify(data.name);
  const sb = getAdminClient();

  const { data: exists } = await sb
    .from("Product")
    .select("id")
    .eq("slug", slug)
    .is("deletedAt", null)
    .maybeSingle();
  if (exists) return { success: false as const, error: "Bu adda mal artıq var. Adı bir az dəyiş." };

  const id = newId();
  const now = nowIso();
  const { data: product, error } = await sb
    .from("Product")
    .insert({
      id,
      name: data.name,
      slug,
      sku: data.sku || null,
      shortDesc: data.shortDesc || null,
      longDesc: data.longDesc || null,
      dailyPrice: data.dailyPrice,
      weeklyPrice: data.weeklyPrice,
      monthlyPrice: data.monthlyPrice,
      deposit: data.deposit,
      showDailyPrice: data.showDailyPrice,
      showWeeklyPrice: data.showWeeklyPrice,
      showMonthlyPrice: data.showMonthlyPrice,
      mainImage: data.mainImage || null,
      status: data.status,
      badge: data.badge || null,
      sortOrder: data.sortOrder,
      isFeatured: data.isFeatured,
      isActive: data.isActive,
      isNew: data.isNew,
      includedItems: data.includedItems,
      usageRules: data.usageRules || null,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      categoryId: data.categoryId,
      brandId: data.brandId,
      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single();

  if (error) return { success: false as const, error: error.message };

  if (data.images.length) {
    const { error: imgErr } = await sb.from("ProductImage").insert(
      data.images.map((img, i) => ({
        id: newId(),
        productId: id,
        url: img.url,
        alt: img.alt || data.name,
        sortOrder: img.sortOrder ?? i,
      })),
    );
    if (imgErr) return { success: false as const, error: imgErr.message };
  }

  if (data.specifications.length) {
    const { error: specErr } = await sb.from("Specification").insert(
      data.specifications.map((s, i) => ({
        id: newId(),
        productId: id,
        label: s.label,
        value: s.value,
        sortOrder: s.sortOrder ?? i,
      })),
    );
    if (specErr) return { success: false as const, error: specErr.message };
  }

  if (data.accessoryIds.length) {
    const { error: accErr } = await sb.from("ProductAccessory").insert(
      data.accessoryIds.map((accessoryId) => ({
        id: newId(),
        productId: id,
        accessoryId,
      })),
    );
    if (accErr) return { success: false as const, error: accErr.message };
  }

  if (data.relatedProductIds.length) {
    const { error: relErr } = await sb.from("RelatedProduct").insert(
      data.relatedProductIds.map((relatedProductId) => ({
        id: newId(),
        productId: id,
        relatedProductId,
      })),
    );
    if (relErr) return { success: false as const, error: relErr.message };
  }

  await logActivity({
    userId: user.id,
    action: "CREATE",
    entity: "Product",
    entityId: product.id,
    details: { name: product.name },
  });
  revalidatePath("/");
  revalidatePath("/avadanliqlar");
  revalidatePath("/admin/mehsullar");
  revalidateTag("products");
  revalidateTag("categories");
  return { success: true as const, data: product };
}

export async function updateProduct(id: string, raw: unknown) {
  const user = await requireAdmin();
  const parsed = productSchema.partial().safeParse(raw);
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)
      .flat()
      .filter(Boolean)[0];
    return {
      success: false as const,
      error: first || "Məlumatlar düzgün deyil",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;
  const sb = getAdminClient();

  const { data: existing } = await sb
    .from("Product")
    .select("id, slug, name")
    .eq("id", id)
    .is("deletedAt", null)
    .maybeSingle();

  if (!existing) return { success: false as const, error: "Məhsul tapılmadı" };

  if (data.slug && data.slug !== existing.slug) {
    const { data: clash } = await sb
      .from("Product")
      .select("id")
      .eq("slug", data.slug)
      .is("deletedAt", null)
      .maybeSingle();
    if (clash) return { success: false as const, error: "Bu slug artıq mövcuddur" };
  }

  const patch: Record<string, unknown> = { updatedAt: nowIso() };
  if (data.name !== undefined) patch.name = data.name;
  if (data.slug !== undefined) patch.slug = data.slug;
  if (data.sku !== undefined) patch.sku = data.sku || null;
  if (data.shortDesc !== undefined) patch.shortDesc = data.shortDesc || null;
  if (data.longDesc !== undefined) patch.longDesc = data.longDesc || null;
  if (data.dailyPrice !== undefined) patch.dailyPrice = data.dailyPrice;
  if (data.weeklyPrice !== undefined) patch.weeklyPrice = data.weeklyPrice;
  if (data.monthlyPrice !== undefined) patch.monthlyPrice = data.monthlyPrice;
  if (data.deposit !== undefined) patch.deposit = data.deposit;
  if (data.showDailyPrice !== undefined) patch.showDailyPrice = data.showDailyPrice;
  if (data.showWeeklyPrice !== undefined) patch.showWeeklyPrice = data.showWeeklyPrice;
  if (data.showMonthlyPrice !== undefined) patch.showMonthlyPrice = data.showMonthlyPrice;
  if (data.mainImage !== undefined) patch.mainImage = data.mainImage || null;
  if (data.status !== undefined) patch.status = data.status;
  if (data.badge !== undefined) patch.badge = data.badge || null;
  if (data.sortOrder !== undefined) patch.sortOrder = data.sortOrder;
  if (data.isFeatured !== undefined) patch.isFeatured = data.isFeatured;
  if (data.isActive !== undefined) patch.isActive = data.isActive;
  if (data.isNew !== undefined) patch.isNew = data.isNew;
  if (data.includedItems !== undefined) patch.includedItems = data.includedItems;
  if (data.usageRules !== undefined) patch.usageRules = data.usageRules || null;
  if (data.seoTitle !== undefined) patch.seoTitle = data.seoTitle || null;
  if (data.seoDescription !== undefined) patch.seoDescription = data.seoDescription || null;
  if (data.categoryId !== undefined) patch.categoryId = data.categoryId;
  if (data.brandId !== undefined) patch.brandId = data.brandId;

  const { error: updateError } = await sb.from("Product").update(patch).eq("id", id);
  if (updateError) return { success: false as const, error: updateError.message };

  if (data.images) {
    await sb.from("ProductImage").delete().eq("productId", id);
    if (data.images.length) {
      const { error: imgErr } = await sb.from("ProductImage").insert(
        data.images.map((img, i) => ({
          id: newId(),
          productId: id,
          url: img.url,
          alt: img.alt || data.name || existing.name,
          sortOrder: img.sortOrder ?? i,
        })),
      );
      if (imgErr) return { success: false as const, error: imgErr.message };
    }
  }

  if (data.specifications) {
    await sb.from("Specification").delete().eq("productId", id);
    if (data.specifications.length) {
      const { error: specErr } = await sb.from("Specification").insert(
        data.specifications.map((s, i) => ({
          id: newId(),
          productId: id,
          label: s.label,
          value: s.value,
          sortOrder: s.sortOrder ?? i,
        })),
      );
      if (specErr) return { success: false as const, error: specErr.message };
    }
  }

  if (data.accessoryIds) {
    await sb.from("ProductAccessory").delete().eq("productId", id);
    if (data.accessoryIds.length) {
      const { error: accErr } = await sb.from("ProductAccessory").insert(
        data.accessoryIds.map((accessoryId) => ({
          id: newId(),
          productId: id,
          accessoryId,
        })),
      );
      if (accErr) return { success: false as const, error: accErr.message };
    }
  }

  if (data.relatedProductIds) {
    await sb.from("RelatedProduct").delete().eq("productId", id);
    if (data.relatedProductIds.length) {
      const { error: relErr } = await sb.from("RelatedProduct").insert(
        data.relatedProductIds.map((relatedProductId) => ({
          id: newId(),
          productId: id,
          relatedProductId,
        })),
      );
      if (relErr) return { success: false as const, error: relErr.message };
    }
  }

  await logActivity({
    userId: user.id,
    action: "UPDATE",
    entity: "Product",
    entityId: id,
    details: { name: data.name || existing.name },
  });
  revalidatePath("/");
  revalidatePath("/avadanliqlar");
  revalidatePath(`/avadanliqlar/${existing.slug}`);
  revalidatePath("/admin/mehsullar");
  revalidateTag("products");
  revalidateTag(`product-${existing.slug}`);
  return { success: true as const };
}

export async function deleteProduct(id: string) {
  const user = await requireAdmin();
  const sb = getAdminClient();
  const { data: existing } = await sb
    .from("Product")
    .select("name, slug, sku")
    .eq("id", id)
    .is("deletedAt", null)
    .maybeSingle();
  if (!existing) return { success: false as const, error: "Məhsul tapılmadı" };

  const stamp = Date.now();
  const { data: product, error } = await sb
    .from("Product")
    .update({
      deletedAt: nowIso(),
      isActive: false,
      // UNIQUE slug/sku azad olsun ki, eyni adda yenidən yaradıla bilsin
      slug: `${existing.slug}-deleted-${stamp}`,
      sku: existing.sku ? `${existing.sku}-DEL-${stamp}` : null,
      updatedAt: nowIso(),
    })
    .eq("id", id)
    .select("name")
    .single();

  if (error) return { success: false as const, error: error.message };

  await logActivity({
    userId: user.id,
    action: "DELETE",
    entity: "Product",
    entityId: id,
    details: { name: product.name },
  });
  revalidatePath("/admin/mehsullar");
  revalidatePath("/avadanliqlar");
  revalidateTag("products");
  return { success: true as const };
}

export async function duplicateProduct(id: string) {
  const user = await requireAdmin();
  const sb = getAdminClient();

  const { data: source, error: fetchError } = await sb
    .from("Product")
    .select(
      "*, images:ProductImage(*), specifications:Specification(*), accessories:ProductAccessory(*), relatedFrom:RelatedProduct(*)",
    )
    .eq("id", id)
    .is("deletedAt", null)
    .maybeSingle();

  if (fetchError) return { success: false as const, error: fetchError.message };
  if (!source) return { success: false as const, error: "Tapılmadı" };

  const copyId = newId();
  const slug = `${source.slug}-copy-${Date.now().toString(36)}`;
  const now = nowIso();

  const { data: copy, error: createError } = await sb
    .from("Product")
    .insert({
      id: copyId,
      name: `${source.name} (kopiya)`,
      slug,
      sku: source.sku ? `${source.sku}-COPY` : null,
      shortDesc: source.shortDesc,
      longDesc: source.longDesc,
      dailyPrice: source.dailyPrice,
      weeklyPrice: source.weeklyPrice,
      monthlyPrice: source.monthlyPrice,
      deposit: source.deposit,
      showDailyPrice: source.showDailyPrice,
      showWeeklyPrice: source.showWeeklyPrice,
      showMonthlyPrice: source.showMonthlyPrice,
      mainImage: source.mainImage,
      status: source.status,
      badge: source.badge,
      sortOrder: source.sortOrder,
      isFeatured: false,
      isActive: false,
      isNew: source.isNew,
      includedItems: source.includedItems,
      usageRules: source.usageRules,
      seoTitle: source.seoTitle,
      seoDescription: source.seoDescription,
      categoryId: source.categoryId,
      brandId: source.brandId,
      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single();

  if (createError) return { success: false as const, error: createError.message };

  const images = (source.images as { url: string; alt: string | null; sortOrder: number }[]) || [];
  if (images.length) {
    await sb.from("ProductImage").insert(
      images.map((img) => ({
        id: newId(),
        productId: copyId,
        url: img.url,
        alt: img.alt,
        sortOrder: img.sortOrder,
      })),
    );
  }

  const specifications =
    (source.specifications as { label: string; value: string; sortOrder: number }[]) || [];
  if (specifications.length) {
    await sb.from("Specification").insert(
      specifications.map((s) => ({
        id: newId(),
        productId: copyId,
        label: s.label,
        value: s.value,
        sortOrder: s.sortOrder,
      })),
    );
  }

  const accessories = (source.accessories as { accessoryId: string }[]) || [];
  if (accessories.length) {
    await sb.from("ProductAccessory").insert(
      accessories.map((a) => ({
        id: newId(),
        productId: copyId,
        accessoryId: a.accessoryId,
      })),
    );
  }

  const relatedFrom = (source.relatedFrom as { relatedProductId: string }[]) || [];
  if (relatedFrom.length) {
    await sb.from("RelatedProduct").insert(
      relatedFrom.map((r) => ({
        id: newId(),
        productId: copyId,
        relatedProductId: r.relatedProductId,
      })),
    );
  }

  await logActivity({
    userId: user.id,
    action: "DUPLICATE",
    entity: "Product",
    entityId: copy.id,
    details: { from: id },
  });
  revalidatePath("/admin/mehsullar");
  return { success: true as const, data: copy };
}

export async function toggleFeatured(id: string) {
  const user = await requireAdmin();
  const sb = getAdminClient();
  const { data: p } = await sb.from("Product").select("isFeatured").eq("id", id).maybeSingle();
  if (!p) return { success: false as const, error: "Tapılmadı" };
  await sb.from("Product").update({ isFeatured: !p.isFeatured, updatedAt: nowIso() }).eq("id", id);
  await logActivity({ userId: user.id, action: "TOGGLE_FEATURED", entity: "Product", entityId: id });
  revalidatePath("/");
  revalidatePath("/admin/mehsullar");
  return { success: true as const };
}

export async function toggleActive(id: string) {
  const user = await requireAdmin();
  const sb = getAdminClient();
  const { data: p } = await sb.from("Product").select("isActive").eq("id", id).maybeSingle();
  if (!p) return { success: false as const, error: "Tapılmadı" };
  await sb.from("Product").update({ isActive: !p.isActive, updatedAt: nowIso() }).eq("id", id);
  await logActivity({ userId: user.id, action: "TOGGLE_ACTIVE", entity: "Product", entityId: id });
  revalidatePath("/admin/mehsullar");
  revalidatePath("/avadanliqlar");
  return { success: true as const };
}

export async function archiveProduct(id: string) {
  const user = await requireAdmin();
  const sb = getAdminClient();
  await sb
    .from("Product")
    .update({ archivedAt: nowIso(), isActive: false, updatedAt: nowIso() })
    .eq("id", id);
  await logActivity({ userId: user.id, action: "ARCHIVE", entity: "Product", entityId: id });
  revalidatePath("/admin/mehsullar");
  return { success: true as const };
}

export async function bulkProductAction(
  ids: string[],
  action: "activate" | "deactivate" | "delete" | "feature" | "unfeature" | "archive",
) {
  const user = await requireAdmin();
  if (!ids.length) return { success: false as const, error: "Seçim yoxdur" };

  const sb = getAdminClient();
  const now = nowIso();

  switch (action) {
    case "activate":
      await sb.from("Product").update({ isActive: true, updatedAt: now }).in("id", ids);
      break;
    case "deactivate":
      await sb.from("Product").update({ isActive: false, updatedAt: now }).in("id", ids);
      break;
    case "delete":
      await sb
        .from("Product")
        .update({ deletedAt: now, isActive: false, updatedAt: now })
        .in("id", ids);
      break;
    case "feature":
      await sb.from("Product").update({ isFeatured: true, updatedAt: now }).in("id", ids);
      break;
    case "unfeature":
      await sb.from("Product").update({ isFeatured: false, updatedAt: now }).in("id", ids);
      break;
    case "archive":
      await sb
        .from("Product")
        .update({ archivedAt: now, isActive: false, updatedAt: now })
        .in("id", ids);
      break;
  }

  await logActivity({
    userId: user.id,
    action: `BULK_${action.toUpperCase()}`,
    entity: "Product",
    details: { ids },
  });
  revalidatePath("/admin/mehsullar");
  revalidatePath("/avadanliqlar");
  return { success: true as const };
}

export async function reorderProducts(orderedIds: string[]) {
  const user = await requireAdmin();
  const sb = getAdminClient();
  const now = nowIso();
  await Promise.all(
    orderedIds.map((id, index) =>
      sb.from("Product").update({ sortOrder: index, updatedAt: now }).eq("id", id),
    ),
  );
  await logActivity({ userId: user.id, action: "REORDER", entity: "Product", details: { orderedIds } });
  revalidatePath("/avadanliqlar");
  revalidatePath("/admin/mehsullar");
  return { success: true as const };
}

export async function incrementView(productId: string) {
  try {
    const sb = getAdminClient();
    const { data: product } = await sb
      .from("Product")
      .select("viewCount")
      .eq("id", productId)
      .maybeSingle();

    if (product) {
      await sb
        .from("Product")
        .update({ viewCount: (product.viewCount ?? 0) + 1, updatedAt: nowIso() })
        .eq("id", productId);
    }

    await sb.from("ProductView").insert({
      id: newId(),
      productId,
      createdAt: nowIso(),
    });
  } catch (err) {
    console.error("[incrementView]", err);
  }
}

export async function trackWhatsAppClick(
  productId: string | null,
  priceType?: string,
  source?: string,
) {
  const sb = getAdminClient();

  if (productId) {
    const { data: product } = await sb
      .from("Product")
      .select("whatsappClicks")
      .eq("id", productId)
      .maybeSingle();

    if (product) {
      await sb
        .from("Product")
        .update({
          whatsappClicks: (product.whatsappClicks ?? 0) + 1,
          updatedAt: nowIso(),
        })
        .eq("id", productId);
    }
  }

  await sb.from("WhatsAppClick").insert({
    id: newId(),
    productId,
    priceType: (priceType as PriceType) || null,
    source: source || "product",
    createdAt: nowIso(),
  });

  return { success: true as const };
}

export async function getFeaturedProducts(limit = 6) {
  const sb = getAdminClient();
  const { data: items, error } = await sb
    .from("Product")
    .select(PRODUCT_LIST_SELECT)
    .eq("isActive", true)
    .eq("isFeatured", true)
    .is("deletedAt", null)
    .is("archivedAt", null)
    .order("sortOrder", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return ((items || []) as unknown as Record<string, unknown>[]).map((p) => normalizeListProduct(p));
}
