"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { RecIndicator, TimecodePrice } from "@/components/ui/Form";
import { formatPrice } from "@/lib/utils";
import { az } from "@/lib/i18n/az";

const statusLabel: Record<string, string> = {
  AVAILABLE: az.status.AVAILABLE,
  RESERVED: az.status.RESERVED,
  RENTED: az.status.RENTED,
  SERVICE: az.status.SERVICE,
  UNAVAILABLE: az.status.UNAVAILABLE,
};

export type CardProduct = {
  id: string;
  name: string;
  slug: string;
  shortDesc?: string | null;
  dailyPrice?: number | null;
  mainImage?: string | null;
  status: string;
  brand?: { name: string } | null;
  category?: { name: string } | null;
  isFeatured?: boolean;
  isNew?: boolean;
};

export function ProductCard({ product, large }: { product: CardProduct; large?: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });
  const [tilt, setTilt] = useState(false);

  useEffect(() => {
    setTilt(window.matchMedia("(pointer: fine)").matches);
  }, []);

  return (
    <Link
      ref={ref}
      href={`/avadanliqlar/${product.slug}`}
      data-cursor="view"
      onMouseMove={(e) => {
        if (!tilt) return;
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      className={`group relative block min-h-[280px] overflow-hidden border border-[var(--border)] bg-[var(--bg-elevated)] touch-manipulation active:scale-[0.99] sm:min-h-[320px] ${
        large ? "md:col-span-2 md:row-span-2 md:min-h-[420px]" : ""
      }`}
    >
      <motion.div
        style={tilt ? { rotateX: rx, rotateY: ry, transformPerspective: 800 } : undefined}
        className="h-full min-h-[inherit]"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#1c1c20] via-[#0d0d0f] to-[#18200a]" />
        {product.mainImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.mainImage}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="display-font text-5xl text-white/10">{product.name.slice(0, 1)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2 sm:left-4 sm:top-4">
          <RecIndicator status={product.status} label={statusLabel[product.status] || product.status} />
          {product.isNew && (
            <span className="border border-[var(--accent)]/40 px-2 py-0.5 text-[10px] uppercase text-[var(--accent)]">
              Yeni
            </span>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--fg-muted)] sm:text-xs sm:tracking-[0.18em]">
            {product.brand?.name} · {product.category?.name}
          </p>
          <h3 className="display-font mt-1 text-xl sm:text-2xl">{product.name}</h3>
          <div className="mt-2.5 flex items-end justify-between gap-3 sm:mt-3">
            <TimecodePrice value={formatPrice(product.dailyPrice).replace(" AZN", "")} />
            <span className="hidden text-xs uppercase tracking-wider text-[var(--fg-muted)] group-hover:text-[var(--accent)] sm:inline">
              Detallara bax →
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
