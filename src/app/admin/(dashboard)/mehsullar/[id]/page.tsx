import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "@/actions/products";
import { getCategories, getBrands } from "@/actions/catalog";
import { ProductForm } from "@/components/admin/ProductForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, categories, brands] = await Promise.all([
    getProductById(id),
    getCategories({ admin: true }),
    getBrands({ admin: true }),
  ]);
  if (!product) notFound();

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/mehsullar" className="text-xs text-[var(--fg-muted)] hover:text-[var(--fg)]">
          ← Kirayə malları
        </Link>
        <h1 className="display-font mt-3 text-3xl md:text-4xl">Redaktə</h1>
        <p className="mt-2 text-sm text-[var(--fg-muted)]">{product.name as string}</p>
      </div>
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        brands={brands.map((b) => ({ id: b.id, name: b.name }))}
        initial={product as never}
      />
    </div>
  );
}
