import Link from "next/link";
import { ProductCard, type CardProduct } from "@/components/products/ProductCard";

export function FeaturedSection({ products }: { products: CardProduct[] }) {
  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--accent)]">Seçilmiş</p>
          <h2 className="display-font mt-2 text-3xl sm:text-4xl lg:text-5xl">Avadanlıqlar</h2>
        </div>
        <Link
          href="/avadanliqlar"
          className="shrink-0 text-sm text-[var(--fg-muted)] transition hover:text-[var(--accent)]"
        >
          Hamısı →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
