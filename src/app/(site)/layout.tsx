import { CustomCursor } from "@/components/cursor/CustomCursor";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MaintenanceScreen } from "@/components/layout/MaintenanceScreen";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { getNavigation, getPublicSettings } from "@/actions/admin";
import { getCategories } from "@/actions/catalog";
import { DEFAULT_SETTINGS } from "@/lib/settings";
import { unstable_cache } from "next/cache";

const getSiteShell = unstable_cache(
  async () => {
    const [settings, nav, categories] = await Promise.all([
      getPublicSettings(),
      getNavigation(),
      getCategories(),
    ]);
    return { settings, nav, categories };
  },
  ["site-shell-v1"],
  { revalidate: 60 },
);

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  let settings = DEFAULT_SETTINGS;
  let nav: { label: string; href: string }[] = [];
  let categories: Awaited<ReturnType<typeof getCategories>> = [];

  try {
    const shell = await getSiteShell();
    settings = shell.settings;
    nav = shell.nav;
    categories = shell.categories;
  } catch (err) {
    console.error("[site-layout] shell load failed", err);
  }

  if (settings.maintenanceMode) {
    return <MaintenanceScreen message={settings.announcementBar} />;
  }

  const items = nav.map((n) => {
    const cat = categories.find(
      (c) => n.href === `/kateqoriya/${c.slug}` || n.href.endsWith(`/${c.slug}`),
    );
    return {
      label: n.label,
      href: n.href,
      count: cat?._count.products,
    };
  });

  return (
    <>
      <AnnouncementBar text={settings.announcementBar} />
      <LoadingScreen />
      <CustomCursor />
      <Navbar items={items} whatsappNumber={settings.whatsappNumber} />
      <main className="min-h-screen">{children}</main>
      <Footer
        slogan={settings.heroSlogan}
        whatsappNumber={settings.whatsappNumber}
        phone={settings.phone}
        email={settings.email}
        address={settings.address}
        footerText={settings.footerText}
        logo={settings.logo}
        instagram={settings.instagram}
        tiktok={settings.tiktok}
        youtube={settings.youtube}
        categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
      />
    </>
  );
}
