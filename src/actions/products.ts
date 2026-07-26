"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-log";
import { productSchema } from "@/lib/validations/product";
import { slugify } from "@/lib/utils";
import { AvailabilityStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user;
}

function serializeProduct(p: Record<string, unknown>) {
  // Deep-convert Prisma Decimal / nested relations for Client Components
  return JSON.parse(
    JSON.stringify(p, (_key, value) => {
      if (
        value !== null &&
        typeof value === "object" &&
        typeof (value as { toNumber?: unknown }).toNumber === "function"
      ) {
        return Number((value as { toNumber: () => number }).toNumber());
      }
      if (typeof value === "bigint") return Number(value);
      return value;
    }),
  ) as Record<string, unknown>;
}

const productInclude = {
  category: true,
  brand: true,
  images: { orderBy: { sortOrder: "asc" as const } },
  specifications: { orderBy: { sortOrder: "asc" as const } },
};

export async function getProducts(filters: {
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
}) {
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 12;
  const where: Prisma.ProductWhereInput = {
    deletedAt: null,
    ...(filters.admin ? {} : { isActive: true, archivedAt: null }),
  };

  if (filters.categorySlug) where.category = { slug: filters.categorySlug, deletedAt: null };
  if (filters.brandSlug) where.brand = { slug: filters.brandSlug, deletedAt: null };
  if (filters.status) where.status = filters.status;
  if (filters.isFeatured) where.isFeatured = true;
  if (filters.isNew) where.isNew = true;
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { shortDesc: { contains: filters.search, mode: "insensitive" } },
      { brand: { name: { contains: filters.search, mode: "insensitive" } } },
    ];
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.dailyPrice = {};
    if (filters.minPrice !== undefined) where.dailyPrice.gte = filters.minPrice;
    if (filters.maxPrice !== undefined) where.dailyPrice.lte = filters.maxPrice;
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { sortOrder: "asc" };
  switch (filters.sort) {
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    case "price-asc":
      orderBy = { dailyPrice: "asc" };
      break;
    case "price-desc":
      orderBy = { dailyPrice: "desc" };
      break;
    case "popular":
      orderBy = { viewCount: "desc" };
      break;
    case "recommended":
      orderBy = { isFeatured: "desc" };
      break;
    default:
      orderBy = { sortOrder: "asc" };
  }

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    items: items.map((p) => serializeProduct(p as never)),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, deletedAt: null, isActive: true },
    include: {
      ...productInclude,
      bookingDates: true,
      accessories: {
        include: {
          accessory: { include: { brand: true, category: true, images: true } },
        },
      },
      relatedFrom: {
        include: {
          relatedProduct: { include: { brand: true, category: true, images: true } },
        },
      },
    },
  });
  if (!product) return null;
  return serializeProduct(product as never);
}

export async function getProductById(id: string) {
  await requireAdmin();
  const product = await prisma.product.findFirst({
    where: { id, deletedAt: null },
    include: {
      ...productInclude,
      accessories: true,
      relatedFrom: true,
      bookingDates: true,
    },
  });
  if (!product) return null;
  return serializeProduct(product as never);
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

  const exists = await prisma.product.findUnique({ where: { slug } });
  if (exists) return { success: false as const, error: "Bu adda mal artıq var. Adı bir az dəyiş." };

  const product = await prisma.product.create({
    data: {
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
      images: {
        create: data.images.map((img, i) => ({
          url: img.url,
          alt: img.alt || data.name,
          sortOrder: img.sortOrder ?? i,
        })),
      },
      specifications: {
        create: data.specifications.map((s, i) => ({
          label: s.label,
          value: s.value,
          sortOrder: s.sortOrder ?? i,
        })),
      },
    },
  });

  if (data.accessoryIds.length) {
    await prisma.productAccessory.createMany({
      data: data.accessoryIds.map((accessoryId) => ({ productId: product.id, accessoryId })),
    });
  }
  if (data.relatedProductIds.length) {
    await prisma.relatedProduct.createMany({
      data: data.relatedProductIds.map((relatedProductId) => ({
        productId: product.id,
        relatedProductId,
      })),
    });
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

  const existing = await prisma.product.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return { success: false as const, error: "Məhsul tapılmadı" };

  if (data.slug && data.slug !== existing.slug) {
    const clash = await prisma.product.findUnique({ where: { slug: data.slug } });
    if (clash) return { success: false as const, error: "Bu slug artıq mövcuddur" };
  }

  await prisma.product.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.sku !== undefined && { sku: data.sku || null }),
      ...(data.shortDesc !== undefined && { shortDesc: data.shortDesc || null }),
      ...(data.longDesc !== undefined && { longDesc: data.longDesc || null }),
      ...(data.dailyPrice !== undefined && { dailyPrice: data.dailyPrice }),
      ...(data.weeklyPrice !== undefined && { weeklyPrice: data.weeklyPrice }),
      ...(data.monthlyPrice !== undefined && { monthlyPrice: data.monthlyPrice }),
      ...(data.deposit !== undefined && { deposit: data.deposit }),
      ...(data.showDailyPrice !== undefined && { showDailyPrice: data.showDailyPrice }),
      ...(data.showWeeklyPrice !== undefined && { showWeeklyPrice: data.showWeeklyPrice }),
      ...(data.showMonthlyPrice !== undefined && { showMonthlyPrice: data.showMonthlyPrice }),
      ...(data.mainImage !== undefined && { mainImage: data.mainImage || null }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.badge !== undefined && { badge: data.badge || null }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.isNew !== undefined && { isNew: data.isNew }),
      ...(data.includedItems !== undefined && { includedItems: data.includedItems }),
      ...(data.usageRules !== undefined && { usageRules: data.usageRules || null }),
      ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle || null }),
      ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription || null }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.brandId !== undefined && { brandId: data.brandId }),
    },
  });

  if (data.images) {
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.productImage.createMany({
      data: data.images.map((img, i) => ({
        productId: id,
        url: img.url,
        alt: img.alt || data.name || existing.name,
        sortOrder: img.sortOrder ?? i,
      })),
    });
  }

  if (data.specifications) {
    await prisma.specification.deleteMany({ where: { productId: id } });
    await prisma.specification.createMany({
      data: data.specifications.map((s, i) => ({
        productId: id,
        label: s.label,
        value: s.value,
        sortOrder: s.sortOrder ?? i,
      })),
    });
  }

  if (data.accessoryIds) {
    await prisma.productAccessory.deleteMany({ where: { productId: id } });
    if (data.accessoryIds.length) {
      await prisma.productAccessory.createMany({
        data: data.accessoryIds.map((accessoryId) => ({ productId: id, accessoryId })),
      });
    }
  }

  if (data.relatedProductIds) {
    await prisma.relatedProduct.deleteMany({ where: { productId: id } });
    if (data.relatedProductIds.length) {
      await prisma.relatedProduct.createMany({
        data: data.relatedProductIds.map((relatedProductId) => ({
          productId: id,
          relatedProductId,
        })),
      });
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
  return { success: true as const };
}

export async function deleteProduct(id: string) {
  const user = await requireAdmin();
  const product = await prisma.product.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });
  await logActivity({
    userId: user.id,
    action: "DELETE",
    entity: "Product",
    entityId: id,
    details: { name: product.name },
  });
  revalidatePath("/admin/mehsullar");
  revalidatePath("/avadanliqlar");
  return { success: true as const };
}

export async function duplicateProduct(id: string) {
  const user = await requireAdmin();
  const source = await prisma.product.findFirst({
    where: { id, deletedAt: null },
    include: { images: true, specifications: true },
  });
  if (!source) return { success: false as const, error: "Tapılmadı" };

  const slug = `${source.slug}-copy-${Date.now().toString(36)}`;
  const copy = await prisma.product.create({
    data: {
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
      images: {
        create: source.images.map((img) => ({
          url: img.url,
          alt: img.alt,
          sortOrder: img.sortOrder,
        })),
      },
      specifications: {
        create: source.specifications.map((s) => ({
          label: s.label,
          value: s.value,
          sortOrder: s.sortOrder,
        })),
      },
    },
  });

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
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) return { success: false as const, error: "Tapılmadı" };
  await prisma.product.update({ where: { id }, data: { isFeatured: !p.isFeatured } });
  await logActivity({ userId: user.id, action: "TOGGLE_FEATURED", entity: "Product", entityId: id });
  revalidatePath("/");
  revalidatePath("/admin/mehsullar");
  return { success: true as const };
}

export async function toggleActive(id: string) {
  const user = await requireAdmin();
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) return { success: false as const, error: "Tapılmadı" };
  await prisma.product.update({ where: { id }, data: { isActive: !p.isActive } });
  await logActivity({ userId: user.id, action: "TOGGLE_ACTIVE", entity: "Product", entityId: id });
  revalidatePath("/admin/mehsullar");
  revalidatePath("/avadanliqlar");
  return { success: true as const };
}

export async function archiveProduct(id: string) {
  const user = await requireAdmin();
  await prisma.product.update({
    where: { id },
    data: { archivedAt: new Date(), isActive: false },
  });
  await logActivity({ userId: user.id, action: "ARCHIVE", entity: "Product", entityId: id });
  revalidatePath("/admin/mehsullar");
  return { success: true as const };
}

export async function bulkProductAction(ids: string[], action: "activate" | "deactivate" | "delete" | "feature" | "unfeature" | "archive") {
  const user = await requireAdmin();
  if (!ids.length) return { success: false as const, error: "Seçim yoxdur" };

  switch (action) {
    case "activate":
      await prisma.product.updateMany({ where: { id: { in: ids } }, data: { isActive: true } });
      break;
    case "deactivate":
      await prisma.product.updateMany({ where: { id: { in: ids } }, data: { isActive: false } });
      break;
    case "delete":
      await prisma.product.updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date(), isActive: false },
      });
      break;
    case "feature":
      await prisma.product.updateMany({ where: { id: { in: ids } }, data: { isFeatured: true } });
      break;
    case "unfeature":
      await prisma.product.updateMany({ where: { id: { in: ids } }, data: { isFeatured: false } });
      break;
    case "archive":
      await prisma.product.updateMany({
        where: { id: { in: ids } },
        data: { archivedAt: new Date(), isActive: false },
      });
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
  await Promise.all(
    orderedIds.map((id, index) =>
      prisma.product.update({ where: { id }, data: { sortOrder: index } }),
    ),
  );
  await logActivity({ userId: user.id, action: "REORDER", entity: "Product", details: { orderedIds } });
  revalidatePath("/avadanliqlar");
  revalidatePath("/admin/mehsullar");
  return { success: true as const };
}

export async function incrementView(productId: string) {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: { viewCount: { increment: 1 } },
    });
    await prisma.productView.create({ data: { productId } });
  } catch (err) {
    console.error("[incrementView]", err);
  }
}

export async function trackWhatsAppClick(productId: string | null, priceType?: string, source?: string) {
  if (productId) {
    await prisma.product.update({
      where: { id: productId },
      data: { whatsappClicks: { increment: 1 } },
    });
  }
  await prisma.whatsAppClick.create({
    data: {
      productId,
      priceType: (priceType as "DAILY" | "WEEKLY" | "MONTHLY") || null,
      source: source || "product",
    },
  });
  return { success: true as const };
}

export async function getFeaturedProducts(limit = 6) {
  const items = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true, deletedAt: null, archivedAt: null },
    include: productInclude,
    orderBy: { sortOrder: "asc" },
    take: limit,
  });
  return items.map((p) => serializeProduct(p as never));
}
