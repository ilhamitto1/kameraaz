import Link from "next/link";
import { getProducts } from "@/actions/products";
import { formatPrice } from "@/lib/utils";
import { ProductAdminActions } from "@/components/admin/ProductAdminActions";

export default async function AdminProductsPage() {
  const { items } = await getProducts({ admin: true, pageSize: 100, sort: "newest" });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="display-font text-3xl">Məhsullar</h1>
        <Link
          href="/admin/mehsullar/yeni"
          className="bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#050505]"
        >
          Yeni məhsul
        </Link>
      </div>
      <div className="mt-8 overflow-x-auto border border-[var(--border)]">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wider text-[var(--fg-muted)]">
            <tr>
              <th className="p-3">Ad</th>
              <th className="p-3">Qiymət</th>
              <th className="p-3">Status</th>
              <th className="p-3">Baxış</th>
              <th className="p-3">WA</th>
              <th className="p-3">Əməliyyat</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id as string} className="border-t border-[var(--border)]">
                <td className="p-3">
                  <Link href={`/admin/mehsullar/${p.id}`} className="hover:text-[var(--accent)]">
                    {p.name as string}
                  </Link>
                  <div className="text-xs text-[var(--fg-muted)]">
                    {(p.brand as { name: string })?.name} ·{" "}
                    {(p.category as { name: string })?.name}
                    {p.isFeatured ? " · ★" : ""}
                    {!p.isActive ? " · deaktiv" : ""}
                  </div>
                </td>
                <td className="p-3 mono">{formatPrice(p.dailyPrice as number)}</td>
                <td className="p-3">{p.status as string}</td>
                <td className="p-3">{p.viewCount as number}</td>
                <td className="p-3">{p.whatsappClicks as number}</td>
                <td className="p-3">
                  <ProductAdminActions
                    id={p.id as string}
                    isFeatured={!!p.isFeatured}
                    isActive={!!p.isActive}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
