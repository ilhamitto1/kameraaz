import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/utils";

/** Slim card payload — O(k) fields needed for list UI, not full product graph. */
const cardSelect = {
  id: true,
  name: true,
  slug: true,
  shortDesc: true,
  dailyPrice: true,
  mainImage: true,
  status: true,
  isFeatured: true,
  isNew: true,
  updatedAt: true,
  brand: { select: { name: true } },
  category: { select: { name: true, slug: true } },
} as const;

function serializeCard(p: {
  id: string;
  name: string;
  slug: string;
  shortDesc: string | null;
  dailyPrice: unknown;
  mainImage: string | null;
  status: string;
  isFeatured: boolean;
  isNew: boolean;
  brand: { name: string } | null;
  category: { name: string; slug: string } | null;
}) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    shortDesc: p.shortDesc,
    dailyPrice: decimalToNumber(p.dailyPrice as never),
    mainImage: p.mainImage,
    status: p.status,
    isFeatured: p.isFeatured,
    isNew: p.isNew,
    brand: p.brand,
    category: p.category,
  };
}

export const getCachedPublicCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      where: { deletedAt: null, isVisible: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        updatedAt: true,
        _count: { select: { products: { where: { deletedAt: null, isActive: true } } } },
      },
      orderBy: { sortOrder: "asc" },
    });
  },
  ["public-categories-v2"],
  { revalidate: 120, tags: ["categories"] },
);

export const getCachedPublicBrands = unstable_cache(
  async () => {
    return prisma.brand.findMany({
      where: { deletedAt: null, isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    });
  },
  ["public-brands-v2"],
  { revalidate: 120, tags: ["brands"] },
);

export const getCachedFeaturedProducts = unstable_cache(
  async (limit = 6) => {
    const items = await prisma.product.findMany({
      where: { deletedAt: null, isActive: true, archivedAt: null, isFeatured: true },
      select: cardSelect,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: limit,
    });
    return items.map(serializeCard);
  },
  ["featured-products-v2"],
  { revalidate: 120, tags: ["products"] },
);

export function getCachedCategoryListing(slug: string) {
  return unstable_cache(
    async () => {
      const cat = await prisma.category.findFirst({
        where: { slug, deletedAt: null, isVisible: true },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          updatedAt: true,
          _count: { select: { products: { where: { deletedAt: null, isActive: true } } } },
        },
      });
      if (!cat) return null;

      const items = await prisma.product.findMany({
        where: {
          deletedAt: null,
          isActive: true,
          archivedAt: null,
          categoryId: cat.id,
        },
        select: cardSelect,
        orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
        take: 48,
      });

      return { category: cat, products: items.map(serializeCard) };
    },
    [`category-listing-${slug}`],
    { revalidate: 120, tags: ["products", "categories", `category-${slug}`] },
  )();
}

export function getCachedCatalogPage(input: {
  categorySlug?: string;
  brandSlug?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = input.page || 1;
  const pageSize = input.pageSize || 12;
  const sort = input.sort || "recommended";
  const key = [
    "catalog",
    input.categorySlug || "-",
    input.brandSlug || "-",
    sort,
    String(page),
    String(pageSize),
  ].join(":");

  return unstable_cache(
    async () => {
      const where = {
        deletedAt: null as const,
        isActive: true,
        archivedAt: null,
        ...(input.categorySlug
          ? { category: { slug: input.categorySlug, deletedAt: null } }
          : {}),
        ...(input.brandSlug ? { brand: { slug: input.brandSlug, deletedAt: null } } : {}),
      };

      let orderBy: Record<string, "asc" | "desc"> = { sortOrder: "asc" };
      if (sort === "newest") orderBy = { createdAt: "desc" };
      else if (sort === "price-asc") orderBy = { dailyPrice: "asc" };
      else if (sort === "price-desc") orderBy = { dailyPrice: "desc" };
      else if (sort === "popular") orderBy = { viewCount: "desc" };
      else if (sort === "recommended") orderBy = { isFeatured: "desc" };

      const [total, items] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          select: cardSelect,
          orderBy,
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ]);

      return {
        items: items.map(serializeCard),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
      };
    },
    [key],
    { revalidate: 60, tags: ["products"] },
  )();
}

export function getCachedProductBySlug(slug: string) {
  return unstable_cache(
    async () => {
      const product = await prisma.product.findFirst({
        where: { slug, deletedAt: null, isActive: true },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { sortOrder: "asc" }, select: { id: true, url: true, alt: true } },
          specifications: {
            orderBy: { sortOrder: "asc" },
            select: { id: true, label: true, value: true },
          },
        },
      });
      if (!product) return null;

      return JSON.parse(
        JSON.stringify(product, (_k, value) => {
          if (
            value !== null &&
            typeof value === "object" &&
            typeof (value as { toNumber?: unknown }).toNumber === "function"
          ) {
            return Number((value as { toNumber: () => number }).toNumber());
          }
          return value;
        }),
      ) as Record<string, unknown>;
    },
    [`product-${slug}`],
    { revalidate: 120, tags: ["products", `product-${slug}`] },
  )();
}

export function getCachedRelatedByCategory(categorySlug: string, excludeId: string, take = 4) {
  return unstable_cache(
    async () => {
      const items = await prisma.product.findMany({
        where: {
          deletedAt: null,
          isActive: true,
          archivedAt: null,
          category: { slug: categorySlug },
          NOT: { id: excludeId },
        },
        select: cardSelect,
        orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
        take,
      });
      return items.map(serializeCard);
    },
    [`related-${categorySlug}-${excludeId}`],
    { revalidate: 120, tags: ["products"] },
  )();
}

export async function getAllCategorySlugs() {
  return prisma.category.findMany({
    where: { deletedAt: null, isVisible: true },
    select: { slug: true },
  });
}

export async function getAllProductSlugs() {
  return prisma.product.findMany({
    where: { deletedAt: null, isActive: true },
    select: { slug: true },
  });
}
