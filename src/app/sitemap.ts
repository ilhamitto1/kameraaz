import type { MetadataRoute } from "next";
import { getAdminClient } from "@/lib/supabase/admin";
import { absoluteUrl } from "@/lib/utils";

const staticRoutes = (): MetadataRoute.Sitemap =>
  ["", "/avadanliqlar", "/elaqe", "/haqqimizda", "/mexfilik-siyaseti", "/istifade-sertleri"].map(
    (path) => ({
      url: absoluteUrl(path || "/"),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    }),
  );

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const sb = getAdminClient();
    const [{ data: products }, { data: categories }] = await Promise.all([
      sb.from("Product").select("slug, updatedAt").eq("isActive", true).is("deletedAt", null),
      sb.from("Category").select("slug, updatedAt").eq("isVisible", true).is("deletedAt", null),
    ]);

    return [
      ...staticRoutes(),
      ...(products || []).map((p) => ({
        url: absoluteUrl(`/avadanliqlar/${p.slug}`),
        lastModified: new Date(p.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...(categories || []).map((c) => ({
        url: absoluteUrl(`/kateqoriya/${c.slug}`),
        lastModified: new Date(c.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    return staticRoutes();
  }
}
