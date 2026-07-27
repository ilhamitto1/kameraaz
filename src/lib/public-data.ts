import { unstable_cache } from "next/cache";
import { getAdminClient } from "@/lib/supabase/admin";
import { serializeRow } from "@/lib/supabase/utils";
import { decimalToNumber } from "@/lib/utils";
import type { CardProduct } from "@/components/products/ProductCard";

const CARD_SELECT =
  "id, name, slug, shortDesc, dailyPrice, mainImage, status, isFeatured, isNew, updatedAt, brand:Brand(name), category:Category(name, slug)";

const CARD_SELECT_WITH_ACTIVE =
  "id, name, slug, shortDesc, dailyPrice, mainImage, status, isFeatured, isNew, updatedAt, deletedAt, isActive, archivedAt, brand:Brand(name), category:Category(name, slug)";

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
}): CardProduct {
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
    category: p.category ? { name: p.category.name } : null,
  };
}

function asCardProduct(row: unknown): CardProduct {
  return serializeCard(row as Parameters<typeof serializeCard>[0]);
}

function isActiveProduct(row: {
  deletedAt?: string | null;
  isActive?: boolean;
  archivedAt?: string | null;
}) {
  return !row.deletedAt && row.isActive === true && !row.archivedAt;
}

async function countActiveProductsByCategory(): Promise<Map<string, number>> {
  const sb = getAdminClient();
  const { data: rows } = await sb
    .from("Product")
    .select("categoryId")
    .is("deletedAt", null)
    .eq("isActive", true);

  const map = new Map<string, number>();
  for (const row of rows || []) {
    map.set(row.categoryId, (map.get(row.categoryId) || 0) + 1);
  }
  return map;
}

export const getCachedPublicCategories = unstable_cache(
  async () => {
    const sb = getAdminClient();
    const [{ data: categories }, countMap] = await Promise.all([
      sb
        .from("Category")
        .select("id, name, slug, description, icon, updatedAt")
        .is("deletedAt", null)
        .eq("isVisible", true)
        .order("sortOrder", { ascending: true }),
      countActiveProductsByCategory(),
    ]);

    return (categories || []).map((cat) => ({
      ...cat,
      _count: { products: countMap.get(cat.id) || 0 },
    }));
  },
  ["public-categories-v2"],
  { revalidate: 120, tags: ["categories"] },
);

export const getCachedPublicBrands = unstable_cache(
  async () => {
    const sb = getAdminClient();
    const { data } = await sb
      .from("Brand")
      .select("id, name, slug")
      .is("deletedAt", null)
      .eq("isActive", true)
      .order("name", { ascending: true });
    return data || [];
  },
  ["public-brands-v2"],
  { revalidate: 120, tags: ["brands"] },
);

export const getCachedFeaturedProducts = unstable_cache(
  async (limit = 6) => {
    const sb = getAdminClient();
    const { data: items } = await sb
      .from("Product")
      .select(CARD_SELECT)
      .is("deletedAt", null)
      .eq("isActive", true)
      .is("archivedAt", null)
      .eq("isFeatured", true)
      .order("sortOrder", { ascending: true })
      .order("createdAt", { ascending: false })
      .limit(limit);
    return (items || []).map(asCardProduct);
  },
  ["featured-products-v2"],
  { revalidate: 120, tags: ["products"] },
);

export function getCachedCategoryListing(slug: string) {
  return unstable_cache(
    async () => {
      const sb = getAdminClient();
      const { data: cat } = await sb
        .from("Category")
        .select("id, name, slug, description, updatedAt")
        .eq("slug", slug)
        .is("deletedAt", null)
        .eq("isVisible", true)
        .maybeSingle();

      if (!cat) return null;

      const [{ data: items }, countMap] = await Promise.all([
        sb
          .from("Product")
          .select(CARD_SELECT)
          .is("deletedAt", null)
          .eq("isActive", true)
          .is("archivedAt", null)
          .eq("categoryId", cat.id)
          .order("isFeatured", { ascending: false })
          .order("sortOrder", { ascending: true })
          .limit(48),
        countActiveProductsByCategory(),
      ]);

      return {
        category: {
          ...cat,
          _count: { products: countMap.get(cat.id) || 0 },
        },
        products: (items || []).map(asCardProduct),
      };
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
      const sb = getAdminClient();
      const categoryJoin = input.categorySlug
        ? "category:Category!inner(name, slug)"
        : "category:Category(name, slug)";
      const brandJoin = input.brandSlug ? "brand:Brand!inner(name)" : "brand:Brand(name)";
      const select = `id, name, slug, shortDesc, dailyPrice, mainImage, status, isFeatured, isNew, updatedAt, ${brandJoin}, ${categoryJoin}`;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let countQuery = sb.from("Product").select(select, { count: "exact", head: true });
      let dataQuery = sb.from("Product").select(select);

      countQuery = countQuery
        .is("deletedAt", null)
        .eq("isActive", true)
        .is("archivedAt", null);
      dataQuery = dataQuery
        .is("deletedAt", null)
        .eq("isActive", true)
        .is("archivedAt", null);

      if (input.categorySlug) {
        countQuery = countQuery.eq("category.slug", input.categorySlug).is("category.deletedAt", null);
        dataQuery = dataQuery.eq("category.slug", input.categorySlug).is("category.deletedAt", null);
      }
      if (input.brandSlug) {
        countQuery = countQuery.eq("brand.slug", input.brandSlug).is("brand.deletedAt", null);
        dataQuery = dataQuery.eq("brand.slug", input.brandSlug).is("brand.deletedAt", null);
      }

      if (sort === "newest") {
        dataQuery = dataQuery.order("createdAt", { ascending: false });
      } else if (sort === "price-asc") {
        dataQuery = dataQuery.order("dailyPrice", { ascending: true });
      } else if (sort === "price-desc") {
        dataQuery = dataQuery.order("dailyPrice", { ascending: false });
      } else if (sort === "popular") {
        dataQuery = dataQuery.order("viewCount", { ascending: false });
      } else if (sort === "recommended") {
        dataQuery = dataQuery.order("isFeatured", { ascending: false });
      } else {
        dataQuery = dataQuery.order("sortOrder", { ascending: true });
      }

      dataQuery = dataQuery.range(from, to);

      const [{ count }, { data: items }] = await Promise.all([countQuery, dataQuery]);
      const total = count || 0;

      return {
        items: (items || []).map(asCardProduct),
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
      const sb = getAdminClient();
      const { data: product } = await sb
        .from("Product")
        .select(
          `
          *,
          category:Category(id, name, slug),
          brand:Brand(id, name, slug),
          images:ProductImage(id, url, alt, sortOrder),
          specifications:Specification(id, label, value, sortOrder),
          bookingDates:BookingDate(id, startDate, endDate),
          accessories:ProductAccessory(
            accessory:Product(${CARD_SELECT_WITH_ACTIVE})
          ),
          relatedFrom:RelatedProduct(
            relatedProduct:Product(${CARD_SELECT_WITH_ACTIVE})
          )
        `,
        )
        .eq("slug", slug)
        .is("deletedAt", null)
        .eq("isActive", true)
        .maybeSingle();

      if (!product) return null;

      const serialized = serializeRow(product) as Record<string, unknown>;

      if (Array.isArray(serialized.images)) {
        serialized.images = [...(serialized.images as { sortOrder?: number }[])].sort(
          (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
        );
      }
      if (Array.isArray(serialized.specifications)) {
        serialized.specifications = [...(serialized.specifications as { sortOrder?: number }[])].sort(
          (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
        );
      }
      if (Array.isArray(serialized.bookingDates)) {
        serialized.bookingDates = [...(serialized.bookingDates as { startDate?: string }[])].sort(
          (a, b) => (a.startDate || "").localeCompare(b.startDate || ""),
        );
      }

      const accessories = (
        (product.accessories as { accessory: Parameters<typeof serializeCard>[0] & {
          deletedAt?: string | null;
          isActive?: boolean;
          archivedAt?: string | null;
        } }[]) || []
      )
        .map((a) => a.accessory)
        .filter((a) => a && isActiveProduct(a))
        .map(serializeCard);

      const relatedProducts = (
        (product.relatedFrom as { relatedProduct: Parameters<typeof serializeCard>[0] & {
          deletedAt?: string | null;
          isActive?: boolean;
          archivedAt?: string | null;
        } }[]) || []
      )
        .map((r) => r.relatedProduct)
        .filter((r) => r && isActiveProduct(r))
        .map(serializeCard);

      return { ...serialized, accessories, relatedProducts } as Record<string, unknown>;
    },
    [`product-${slug}`],
    { revalidate: 120, tags: ["products", `product-${slug}`] },
  )();
}

export function getCachedRelatedByCategory(categorySlug: string, excludeId: string, take = 4) {
  return unstable_cache(
    async () => {
      const sb = getAdminClient();
      const { data: items } = await sb
        .from("Product")
        .select(
          "id, name, slug, shortDesc, dailyPrice, mainImage, status, isFeatured, isNew, updatedAt, brand:Brand(name), category:Category!inner(name, slug)",
        )
        .is("deletedAt", null)
        .eq("isActive", true)
        .is("archivedAt", null)
        .eq("category.slug", categorySlug)
        .neq("id", excludeId)
        .order("isFeatured", { ascending: false })
        .order("sortOrder", { ascending: true })
        .limit(take);

      return (items || []).map(asCardProduct);
    },
    [`related-${categorySlug}-${excludeId}`],
    { revalidate: 120, tags: ["products"] },
  )();
}

export async function getAllCategorySlugs() {
  const sb = getAdminClient();
  const { data } = await sb
    .from("Category")
    .select("slug")
    .is("deletedAt", null)
    .eq("isVisible", true);
  return data || [];
}

export async function getAllProductSlugs() {
  const sb = getAdminClient();
  const { data } = await sb
    .from("Product")
    .select("slug")
    .is("deletedAt", null)
    .eq("isActive", true);
  return data || [];
}
