import Link from "next/link";
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
  brand: { name: string } | null | undefined;
  category: { name: string } | null | undefined;
  isFeatured?: boolean;
  isNew?: boolean;
};

export function ProductCard({ product, large }: { product: CardProduct; large?: boolean }) {
  return (
    <Link
      href={`/avadanliqlar/${product.slug}`}
      className={`group relative block min-h-[280px] overflow-hidden border border-[var(--border)] bg-[var(--bg-elevated)] touch-manipulation active:opacity-95 sm:min-h-[320px] ${
        large ? "md:col-span-2 md:row-span-2 md:min-h-[420px]" : ""
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#1c1c20] via-[#0d0d0f] to-[#18200a]" />
      {product.mainImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.mainImage}
          alt={product.name}
          className="absolute inset-0 h-full w-full object-cover opacity-85 transition duration-300 group-hover:opacity-100"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="display-font text-5xl text-white/10">{product.name.slice(0, 1)}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

      <div className="absolute left-3 top-3 flex flex-wrap gap-2 sm:left-4 sm:top-4">
        <RecIndicator status={product.status} label={statusLabel[product.status] || product.status} />
        {product.isNew && (
          <span className="border border-[var(--accent)]/40 px-2 py-0.5 text-[10px] uppercase text-[var(--accent)]">
            Yeni
          </span>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--fg-muted)] sm:text-xs">
          {product.brand?.name} · {product.category?.name}
        </p>
        <h3 className="display-font mt-1 text-xl sm:text-2xl">{product.name}</h3>
        <div className="mt-2.5">
          <TimecodePrice value={formatPrice(product.dailyPrice).replace(" AZN", "")} />
        </div>
      </div>
    </Link>
  );
}
