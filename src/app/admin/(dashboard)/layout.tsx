import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  }

  return (
    <div className="min-h-dvh bg-[#070708] text-[var(--fg)] lg:grid lg:grid-cols-[260px_1fr]">
      <AdminSidebar email={session.user.email || ""} signOutAction={signOutAction} />
      <main className="min-w-0 overflow-x-hidden px-3 pb-[max(5.5rem,calc(env(safe-area-inset-bottom)+4rem))] pt-4 sm:px-5 lg:p-8 lg:pb-10">
        {children}
      </main>
    </div>
  );
}
