"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ProductCard, type CardProduct } from "@/components/products/ProductCard";

export function FeaturedSection({ products }: { products: CardProduct[] }) {
  return (
    <section className="relative mx-auto max-w-7xl overflow-hidden px-4 py-16 sm:px-5 sm:py-24 md:px-8 md:py-28">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        className="mb-12 flex items-end justify-between gap-4"
      >
        <div>
          <p className="mono text-xs text-[var(--accent)]">01 // FEATURED</p>
          <h2 className="display-font mt-2 text-3xl sm:text-4xl md:text-6xl">Seçilmiş avadanlıqlar</h2>
        </div>
        <Link href="/avadanliqlar" className="text-sm text-[var(--fg-muted)] hover:text-[var(--accent)]">
          Hamısı →
        </Link>
      </motion.div>

      <div className="grid auto-rows-fr gap-4 md:grid-cols-3" style={{ perspective: 1200 }}>
        {products.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 60, rotateX: 12 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.08, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className={i === 0 ? "md:col-span-2 md:row-span-2" : ""}
          >
            <ProductCard product={p} large={i === 0} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
