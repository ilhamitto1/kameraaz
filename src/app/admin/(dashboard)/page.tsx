import Link from "next/link";
import { Camera, Aperture, Lamp, Move3d, Box, Plus, MessageSquare, Package } from "lucide-react";
import { getDashboardStats } from "@/actions/admin";
import { getCategories } from "@/actions/catalog";

const iconFor = (icon: string | null, slug: string) => {
  const key = (icon || slug || "").toLowerCase();
  if (key.includes("camera") || key.includes("foto")) return Camera;
  if (key.includes("aperture") || key.includes("linza")) return Aperture;
  if (key.includes("lamp") || key.includes("isiq")) return Lamp;
  if (key.includes("move") || key.includes("stabil")) return Move3d;
  return Box;
};

export default async function AdminDashboardPage() {
  const [stats, categories] = await Promise.all([getDashboardStats(), getCategories({ admin: true })]);

  const cards = [
    { label: "Ümumi mal", value: stats.totalProducts },
    { label: "Aktiv", value: stats.activeProducts },
    { label: "Mövcud", value: stats.availableProducts },
    { label: "Kirayədə", value: stats.rentedProducts },
    { label: "Kateqoriya", value: stats.categoryCount },
    { label: "WA klik (7 gün)", value: stats.clicksLast7 },
  ];

  return (
    <div className="space-y-8 sm:space-y-10">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--fg-muted)] sm:text-xs">Xoş gəldin</p>
        <h1 className="display-font mt-1 text-[1.75rem] leading-tight sm:text-3xl md:text-4xl">
          İdarə paneli
        </h1>
        <p className="mt-2 text-sm text-[var(--fg-muted)]">
          Kateqoriya seç — 1 dəqiqəyə mal əlavə et.
        </p>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-medium sm:text-lg">Tez əlavə et</h2>
          <Link href="/admin/mehsullar" className="shrink-0 text-xs text-[var(--accent)]">
            Hamısı →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {categories.map((c) => {
            const Icon = iconFor(c.icon, c.slug);
            return (
              <Link
                key={c.id}
                href={`/admin/mehsullar/yeni?category=${c.id}`}
                className="group flex min-h-14 items-center gap-3 rounded-2xl border border-white/10 bg-[var(--bg-elevated)] p-3.5 touch-manipulation transition active:scale-[0.99] hover:border-[var(--accent)]/35 hover:bg-[var(--accent)]/5 sm:block sm:rounded-3xl sm:p-4"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-[var(--fg-muted)] group-hover:text-[var(--accent)]">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 sm:mt-4">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-[var(--fg-muted)] group-hover:text-[var(--accent)] sm:mt-1">
                    <Plus className="h-3.5 w-3.5" />
                    Qiymət yazıb əlavə et
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-white/10 bg-[var(--bg-elevated)] p-3.5 sm:rounded-3xl sm:p-5">
            <p className="text-[10px] uppercase tracking-wider text-[var(--fg-muted)] sm:text-xs">{c.label}</p>
            <p className="display-font mt-1.5 text-2xl text-[var(--accent)] sm:mt-2 sm:text-4xl">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
        <Link
          href="/admin/mehsullar"
          className="flex min-h-14 items-center gap-3 rounded-2xl border border-white/10 bg-[var(--bg-elevated)] p-4 touch-manipulation hover:border-[var(--accent)]/30 sm:rounded-3xl sm:p-5"
        >
          <Package className="h-5 w-5 shrink-0 text-[var(--accent)]" />
          <div className="min-w-0">
            <p className="font-medium">Kirayə malları</p>
            <p className="text-xs text-[var(--fg-muted)]">Kateqoriya üzrə bax</p>
          </div>
        </Link>
        <Link
          href="/admin/mesajlar"
          className="flex min-h-14 items-center gap-3 rounded-2xl border border-white/10 bg-[var(--bg-elevated)] p-4 touch-manipulation hover:border-[var(--accent)]/30 sm:rounded-3xl sm:p-5"
        >
          <MessageSquare className="h-5 w-5 shrink-0 text-[var(--accent)]" />
          <div className="min-w-0">
            <p className="font-medium">Mesajlar</p>
            <p className="text-xs text-[var(--fg-muted)]">Müştəri sorğuları</p>
          </div>
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-3xl border border-white/10 bg-[var(--bg-elevated)] p-5">
          <h2 className="text-lg font-medium">Ən çox baxılan</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {stats.topViewed.map((p) => (
              <li key={p.id} className="flex justify-between border-b border-white/8 py-2">
                <Link href={`/admin/mehsullar/${p.id}`} className="hover:text-[var(--accent)]">
                  {p.name}
                </Link>
                <span className="mono text-[var(--fg-muted)]">{p.viewCount}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl border border-white/10 bg-[var(--bg-elevated)] p-5">
          <h2 className="text-lg font-medium">WhatsApp klik</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {stats.topWhatsapp.map((p) => (
              <li key={p.id} className="flex justify-between border-b border-white/8 py-2">
                <span>{p.name}</span>
                <span className="mono text-[var(--fg-muted)]">{p.whatsappClicks}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
