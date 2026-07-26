import { CustomCursor } from "@/components/cursor/CustomCursor";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getNavigation, getPublicSettings } from "@/actions/admin";
import { getCategories } from "@/actions/catalog";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, nav, categories] = await Promise.all([
    getPublicSettings(),
    getNavigation(),
    getCategories(),
  ]);

  const items = nav.map((n) => {
    const cat = categories.find((c) => n.href.includes(c.slug));
    return {
      label: n.label,
      href: n.href,
      count: cat?._count.products,
    };
  });

  return (
    <>
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
        categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
      />
    </>
  );
}
