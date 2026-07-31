import Link from "next/link";

type Cat = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count: { products: number };
};

export function CategoryOrbit({ categories }: { categories: Cat[] }) {
  if (!categories.length) return null;

  return (
    <section className="border-y border-[var(--border)] bg-[var(--bg-elevated)] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--accent)]">Kateqoriyalar</p>
        <h2 className="display-font mt-2 text-3xl sm:text-4xl lg:text-5xl">Nə lazımdır?</h2>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/kateqoriya/${c.slug}`}
              prefetch
              className="flex min-h-[140px] flex-col justify-between border border-[var(--border)] bg-[var(--bg)] p-5 transition hover:border-[var(--accent)]/40 touch-manipulation"
            >
              <span className="text-xs text-[var(--fg-muted)]">{c._count.products} məhsul</span>
              <div>
                <h3 className="display-font text-2xl">{c.name}</h3>
                {c.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--fg-muted)]">{c.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
