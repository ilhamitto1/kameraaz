import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export async function getSession() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let name = (user.user_metadata?.name as string) || user.email || "Admin";
  let role = (user.app_metadata?.role as string) || "ADMIN";

  try {
    const sb = getAdminClient();
    const { data: profile } = await sb
      .from("profiles")
      .select("name, role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.name) name = profile.name;
    if (profile?.role) role = profile.role;
  } catch {
    /* profiles cədvəli yoxdursa default role istifadə et */
  }

  return {
    user: {
      id: user.id,
      email: user.email || "",
      name,
      role,
    } satisfies SessionUser,
  };
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN") throw new Error("Forbidden");
  return session.user;
}

/** @deprecated use getSession */
export const auth = getSession;
