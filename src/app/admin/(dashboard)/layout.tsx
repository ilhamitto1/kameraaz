import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/mehsullar", label: "Məhsullar" },
  { href: "/admin/kateqoriyalar", label: "Kateqoriyalar" },
  { href: "/admin/markalar", label: "Markalar" },
  { href: "/admin/mesajlar", label: "Mesajlar" },
  { href: "/admin/rezervasiyalar", label: "Rezervasiyalar" },
  { href: "/admin/parametrler", label: "Parametrlər" },
  { href: "/admin/activity-log", label: "Activity Log" },
];

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-[#050505] text-[var(--fg)] lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-[var(--border)] bg-[var(--bg-elevated)] lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/admin" className="display-font tracking-[0.2em]">
            KZ ADMIN
          </Link>
          <Link href="/" className="text-xs text-[var(--fg-muted)]">
            Sayt
          </Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-col">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap rounded-sm px-3 py-2 text-sm text-[var(--fg-muted)] hover:bg-white/5 hover:text-[var(--fg)]"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/login" });
          }}
          className="hidden px-5 pb-6 lg:block"
        >
          <button type="submit" className="text-xs text-[var(--danger)]">
            Çıxış ({session.user.email})
          </button>
        </form>
      </aside>
      <main className="p-5 md:p-8">{children}</main>
    </div>
  );
}
