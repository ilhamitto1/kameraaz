import Link from "next/link";
import { getCategories, getBrands } from "@/actions/catalog";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const sp = await searchParams;
  const [categories, brands] = await Promise.all([
    getCategories({ admin: true }),
    getBrands({ admin: true }),
  ]);

  const selected = categories.find((c) => c.id === sp.category);

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/mehsullar" className="text-xs text-[var(--fg-muted)] hover:text-[var(--fg)]">
          ← Kirayə malları
        </Link>
        <h1 className="display-font mt-3 text-3xl md:text-4xl">
          {selected ? `${selected.name} əlavə et` : "Yeni kirayə malı"}
        </h1>
        <p className="mt-2 text-sm text-[var(--fg-muted)]">
          Ad + günlük qiymət kifayətdir. Qalanı sonra da doldura bilərsən.
        </p>
      </div>
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        brands={brands.map((b) => ({ id: b.id, name: b.name }))}
        defaultCategoryId={sp.category}
      />
    </div>
  );
}
