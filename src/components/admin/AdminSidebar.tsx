"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Tags,
  MessageSquare,
  CalendarDays,
  Settings,
  ScrollText,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "İdarə paneli", icon: LayoutDashboard, exact: true },
  { href: "/admin/mehsullar", label: "Kirayə malları", icon: Package },
  { href: "/admin/kateqoriyalar", label: "Kateqoriyalar", icon: FolderOpen },
  { href: "/admin/markalar", label: "Markalar", icon: Tags },
  { href: "/admin/mesajlar", label: "Mesajlar", icon: MessageSquare },
  { href: "/admin/rezervasiyalar", label: "Rezervasiyalar", icon: CalendarDays },
  { href: "/admin/parametrler", label: "Parametrlər", icon: Settings },
  { href: "/admin/activity-log", label: "Fəaliyyət", icon: ScrollText },
];

function NavLinks({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {nav.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "inline-flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors touch-manipulation",
              active
                ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                : "text-[var(--fg-muted)] hover:bg-white/5 hover:text-[var(--fg)]",
            )}
          >
            <Icon className="h-4 w-4 shrink-0 opacity-80" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebar({
  email,
  signOutAction,
}: {
  email: string;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Mobile sticky top bar */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-white/10 bg-[#070708]/90 px-3 py-3 backdrop-blur-xl lg:hidden"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <button
          type="button"
          aria-label="Menyu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 touch-manipulation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/admin" className="display-font text-center text-xs tracking-[0.2em]">
          KAMERA.AGENCY
          <span className="block text-[9px] tracking-[0.28em] text-[var(--fg-muted)]">İDARƏ</span>
        </Link>
        <Link
          href="/"
          target="_blank"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-[var(--fg-muted)] touch-manipulation"
          aria-label="Sayt"
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
      </header>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <button
          type="button"
          aria-label="Bağla"
          className={cn(
            "absolute inset-0 bg-black/70 transition-opacity",
            open ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setOpen(false)}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-[min(86vw,300px)] flex-col border-r border-white/10 bg-[#0c0c0e] transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "-translate-x-full",
          )}
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="flex items-center justify-between px-4 py-4">
            <p className="display-font text-sm tracking-[0.18em]">MENYU</p>
            <button
              type="button"
              aria-label="Bağla"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 touch-manipulation"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-4">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
          <form
            action={signOutAction}
            className="border-t border-white/10 px-4 py-4"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            <button
              type="submit"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--danger)]/30 text-sm text-[var(--danger)] touch-manipulation"
            >
              <LogOut className="h-4 w-4" />
              Çıxış
            </button>
            <p className="mt-2 truncate text-center text-[11px] text-[var(--fg-muted)]">{email}</p>
          </form>
        </aside>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden min-h-screen border-r border-white/10 bg-[var(--bg-elevated)] lg:flex lg:flex-col">
        <div className="flex items-center justify-between gap-3 px-5 py-5">
          <Link href="/admin" className="display-font text-sm tracking-[0.18em]">
            KAMERA.AGENCY
            <span className="mt-0.5 block text-[10px] tracking-[0.28em] text-[var(--fg-muted)]">
              İDARƏ
            </span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-[var(--fg-muted)] hover:text-[var(--fg)]"
          >
            Sayt <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <NavLinks />
        </div>
        <form action={signOutAction} className="px-5 pb-6">
          <button
            type="submit"
            className="inline-flex items-center gap-2 text-xs text-[var(--danger)] hover:opacity-80"
          >
            <LogOut className="h-3.5 w-3.5" />
            Çıxış · {email}
          </button>
        </form>
      </aside>
    </>
  );
}
