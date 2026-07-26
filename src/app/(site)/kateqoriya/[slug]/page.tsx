import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryBySlug } from "@/actions/catalog";
import { getProducts } from "@/actions/products";
import { ProductCard } from "@/components/products/ProductCard";
import { absoluteUrl } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  if (!cat) return { title: "Kateqoriya" };
  return {
    title: cat.name,
    description: cat.description || `${cat.name} kirayə — Kameraz.com`,
    alternates: { canonical: absoluteUrl(`/kateqoriya/${slug}`) },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  if (!cat) notFound();
  const result = await getProducts({ categorySlug: slug, pageSize: 24 });

  return (
    <div className="mx-auto max-w-7xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-24 sm:px-5 sm:pt-28 md:px-8 lg:pb-28">
      <p className="mono text-xs text-[var(--accent)]">CATEGORY</p>
      <h1 className="display-font mt-2 text-5xl">{cat.name}</h1>
      <p className="mt-3 max-w-2xl text-[var(--fg-muted)]">{cat.description}</p>
      <p className="mono mt-2 text-xs text-[var(--fg-muted)]">{cat._count.products} məhsul</p>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {result.items.map((p) => (
          <ProductCard key={p.id as string} product={p as never} />
        ))}
      </div>
    </div>
  );
}
