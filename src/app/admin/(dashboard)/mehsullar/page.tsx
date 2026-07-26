import { getProducts } from "@/actions/products";
import { getCategories } from "@/actions/catalog";
import { ProductsAdmin } from "@/components/admin/ProductsAdmin";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const sp = await searchParams;
  const [{ items }, categories] = await Promise.all([
    getProducts({ admin: true, pageSize: 200, sort: "newest" }),
    getCategories({ admin: true }),
  ]);

  const products = items.map((p) => {
    const category = p.category as { id: string; name: string; slug: string } | null;
    const brand = p.brand as { name: string } | null;
    return {
      id: String(p.id),
      name: String(p.name),
      dailyPrice: (p.dailyPrice as number | null) ?? null,
      weeklyPrice: (p.weeklyPrice as number | null) ?? null,
      monthlyPrice: (p.monthlyPrice as number | null) ?? null,
      deposit: (p.deposit as number | null) ?? null,
      status: String(p.status),
      isActive: !!p.isActive,
      isFeatured: !!p.isFeatured,
      mainImage: (p.mainImage as string | null) ?? null,
      categoryId: category?.id || "",
      categoryName: category?.name || "—",
      categorySlug: category?.slug || "",
      brandName: brand?.name || "—",
    };
  });

  const tabs = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    count: products.filter((p) => p.categoryId === c.id).length,
  }));

  // Prefer URL category for initial tab via key remount trick on client — pass as default through ProductsAdmin
  // We'll encode preferred category by sorting tabs / letting client read — add defaultActive prop
  return (
    <ProductsAdmin
      key={sp.category || "all"}
      products={products}
      categories={tabs}
      initialCategoryId={sp.category}
    />
  );
}
