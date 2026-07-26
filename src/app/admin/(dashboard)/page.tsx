import { getDashboardStats } from "@/actions/admin";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    { label: "Ümumi məhsul", value: stats.totalProducts },
    { label: "Aktiv", value: stats.activeProducts },
    { label: "Mövcud", value: stats.availableProducts },
    { label: "Kirayədə", value: stats.rentedProducts },
    { label: "Kateqoriya", value: stats.categoryCount },
    { label: "WA klik (7 gün)", value: stats.clicksLast7 },
  ];

  return (
    <div>
      <h1 className="display-font text-3xl">Dashboard</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
            <p className="text-xs uppercase tracking-wider text-[var(--fg-muted)]">{c.label}</p>
            <p className="display-font mt-2 text-4xl text-[var(--accent)]">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-medium">Ən çox baxılan</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {stats.topViewed.map((p) => (
              <li key={p.id} className="flex justify-between border-b border-[var(--border)] py-2">
                <Link href={`/admin/mehsullar/${p.id}`} className="hover:text-[var(--accent)]">
                  {p.name}
                </Link>
                <span className="mono text-[var(--fg-muted)]">{p.viewCount}</span>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-medium">WhatsApp klik</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {stats.topWhatsapp.map((p) => (
              <li key={p.id} className="flex justify-between border-b border-[var(--border)] py-2">
                <span>{p.name}</span>
                <span className="mono text-[var(--fg-muted)]">{p.whatsappClicks}</span>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-medium">Son mesajlar</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {stats.recentMessages.map((m) => (
              <li key={m.id} className="border-b border-[var(--border)] py-2">
                <p className="text-[var(--fg)]">{m.name}</p>
                <p className="text-[var(--fg-muted)] line-clamp-1">{m.message}</p>
              </li>
            ))}
          </ul>
          <Link href="/admin/mesajlar" className="mt-3 inline-block text-xs text-[var(--accent)]">
            Hamısı →
          </Link>
        </section>
        <section>
          <h2 className="text-lg font-medium">Son fəaliyyət</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {stats.recentActivity.map((a) => (
              <li key={a.id} className="border-b border-[var(--border)] py-2 text-[var(--fg-muted)]">
                <span className="text-[var(--fg)]">{a.action}</span> · {a.entity} ·{" "}
                {a.user?.name || "sistem"}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
