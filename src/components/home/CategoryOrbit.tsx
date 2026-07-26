"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type Cat = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count: { products: number };
};

export function CategoryOrbit({ categories }: { categories: Cat[] }) {
  return (
    <section className="relative overflow-hidden border-y border-[var(--border)] bg-[var(--bg-elevated)] py-16 sm:py-24 md:py-28">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5 md:block"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--accent)]/10 md:block"
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="mono text-xs text-[var(--accent)]">02 // CATEGORIES</p>
          <h2 className="display-font mt-2 text-3xl sm:text-4xl md:text-6xl">Kateqoriyalar</h2>
        </motion.div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, scale: 0.92, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.65 }}
            >
              <Link
                href={`/kateqoriya/${c.slug}`}
                data-cursor="view"
                className="group relative flex min-h-[230px] overflow-hidden border border-[var(--border)] bg-[var(--bg)] p-6"
              >
                <motion.div
                  className="absolute inset-0 origin-center bg-gradient-to-br from-[#1a2208]/80 to-transparent opacity-50"
                  whileHover={{ scale: 1.15, rotate: 2 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    clipPath:
                      i % 2 === 0
                        ? "polygon(0 0, 100% 0, 100% 78%, 0 100%)"
                        : "polygon(0 12%, 100% 0, 100% 100%, 0 100%)",
                  }}
                />
                <div className="relative z-10 flex h-full w-full flex-col justify-between">
                  <span className="mono text-xs text-[var(--fg-muted)]">
                    {String(i + 1).padStart(2, "0")} · {c._count.products} məhsul
                  </span>
                  <div>
                    <h3 className="display-font text-3xl transition group-hover:text-[var(--accent)]">
                      {c.name}
                    </h3>
                    <p className="mt-2 text-sm text-[var(--fg-muted)]">{c.description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
