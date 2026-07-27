-- ⚠️ TƏHLÜKƏLİ — BÜTÜN MƏHSUL / MESAJ / PARAMETR / ŞƏKİL MƏLUMATINI SİLİR
-- Yalnız sıfırdan başlamaq istəyəndə Run et.
-- Adi deploy və ya full-setup üçün BU FAYLI İŞƏ SALMA.

TRUNCATE TABLE
  "WhatsAppClick",
  "ProductView",
  "BookingDate",
  "Specification",
  "ProductImage",
  "ProductAccessory",
  "RelatedProduct",
  "Product",
  "NavigationItem",
  "SocialLink",
  "ContactMessage",
  "ActivityLog",
  "SiteSetting",
  "Category",
  "Brand"
CASCADE;
