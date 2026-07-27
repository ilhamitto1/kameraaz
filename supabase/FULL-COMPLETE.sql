-- =============================================================================
-- kamera.agency — TAM + TƏHLÜKƏSİZ SUPABASE SQL (BİR FAYL)
-- SQL Editor → HAMISINI yapışdır → RUN
--
-- ✅ TRUNCATE YOXDUR — mövcud məhsul / şəkil / mesaj SİLİNMİR
-- ✅ Cədvəllər + seed + Storage (şəkil) + WhatsApp branding
-- ❌ Köhnə skriptdəki TRUNCATE TABLE ... işlətmə — hər şeyi silirdi
--
-- Deploy (Vercel) DB-yə toxunmur.
-- =============================================================================

-- ===================== 1) ENUM =====================
DO $$ BEGIN
  CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE','RESERVED','RENTED','SERVICE','UNAVAILABLE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "MessageStatus" AS ENUM ('NEW','READ','REPLIED','ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "PriceType" AS ENUM ('DAILY','WEEKLY','MONTHLY');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ===================== 2) CƏDVƏLLƏR =====================
CREATE TABLE IF NOT EXISTS "Category" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "image" TEXT,
  "icon" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isVisible" BOOLEAN NOT NULL DEFAULT true,
  "showInNav" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS "Brand" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "slug" TEXT NOT NULL UNIQUE,
  "logo" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS "Product" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "sku" TEXT UNIQUE,
  "shortDesc" TEXT,
  "longDesc" TEXT,
  "dailyPrice" DECIMAL(10,2),
  "weeklyPrice" DECIMAL(10,2),
  "monthlyPrice" DECIMAL(10,2),
  "deposit" DECIMAL(10,2),
  "showDailyPrice" BOOLEAN NOT NULL DEFAULT true,
  "showWeeklyPrice" BOOLEAN NOT NULL DEFAULT true,
  "showMonthlyPrice" BOOLEAN NOT NULL DEFAULT false,
  "mainImage" TEXT,
  "status" "AvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
  "badge" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "isNew" BOOLEAN NOT NULL DEFAULT false,
  "includedItems" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "usageRules" TEXT,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "viewCount" INTEGER NOT NULL DEFAULT 0,
  "whatsappClicks" INTEGER NOT NULL DEFAULT 0,
  "categoryId" TEXT NOT NULL REFERENCES "Category"("id"),
  "brandId" TEXT NOT NULL REFERENCES "Brand"("id"),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  "archivedAt" TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS "ProductImage" (
  "id" TEXT PRIMARY KEY,
  "url" TEXT NOT NULL,
  "alt" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Specification" (
  "id" TEXT PRIMARY KEY,
  "label" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "ProductAccessory" (
  "id" TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "accessoryId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  UNIQUE ("productId","accessoryId")
);

CREATE TABLE IF NOT EXISTS "RelatedProduct" (
  "id" TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "relatedProductId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  UNIQUE ("productId","relatedProductId")
);

CREATE TABLE IF NOT EXISTS "BookingDate" (
  "id" TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "startDate" DATE NOT NULL,
  "endDate" DATE NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ContactMessage" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "subject" TEXT,
  "message" TEXT NOT NULL,
  "status" "MessageStatus" NOT NULL DEFAULT 'NEW',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS "SiteSetting" (
  "id" TEXT PRIMARY KEY,
  "key" TEXT NOT NULL UNIQUE,
  "value" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "NavigationItem" (
  "id" TEXT PRIMARY KEY,
  "label" TEXT NOT NULL,
  "href" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isVisible" BOOLEAN NOT NULL DEFAULT true,
  "categoryId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "SocialLink" (
  "id" TEXT PRIMARY KEY,
  "platform" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "isVisible" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ActivityLog" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT,
  "details" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ProductView" (
  "id" TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
  "ipHash" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "WhatsAppClick" (
  "id" TEXT PRIMARY KEY,
  "productId" TEXT REFERENCES "Product"("id") ON DELETE SET NULL,
  "priceType" "PriceType",
  "source" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "ActivityLog" DROP CONSTRAINT IF EXISTS "ActivityLog_userId_fkey";

CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX IF NOT EXISTS "Product_brandId_idx" ON "Product"("brandId");
CREATE INDEX IF NOT EXISTS "Product_slug_idx" ON "Product"("slug");
CREATE INDEX IF NOT EXISTS "ProductImage_productId_idx" ON "ProductImage"("productId");
CREATE INDEX IF NOT EXISTS "Specification_productId_idx" ON "Specification"("productId");
CREATE INDEX IF NOT EXISTS "BookingDate_productId_idx" ON "BookingDate"("productId");
CREATE INDEX IF NOT EXISTS "ContactMessage_status_idx" ON "ContactMessage"("status");
CREATE INDEX IF NOT EXISTS "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");
CREATE INDEX IF NOT EXISTS "ProductView_productId_idx" ON "ProductView"("productId");
CREATE INDEX IF NOT EXISTS "WhatsAppClick_productId_idx" ON "WhatsAppClick"("productId");

-- ===================== 3) PROFILES =====================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'ADMIN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
CREATE POLICY "profiles_read_own" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_app_meta_data->>'role', 'ADMIN')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TABLE IF EXISTS "User" CASCADE;

-- ===================== 4) SEED (mövcud olanlar qalır) =====================
INSERT INTO "Category" ("id","name","slug","description","icon","sortOrder","isVisible","showInNav","createdAt","updatedAt") VALUES
  ('cat_fotoaparatlar','Fotoaparatlar','fotoaparatlar','Peşəkar foto və hybrid kameralar','Camera',1,true,true,NOW(),NOW()),
  ('cat_linzalar','Linzalar','linzalar','Prime və zoom obyektivlər','Aperture',2,true,true,NOW(),NOW()),
  ('cat_isiqlar','İşıqlar','isiqlar','LED və continuous işıq sistemləri','Lamp',3,true,true,NOW(),NOW()),
  ('cat_stabilizatorlar','Stabilizatorlar','stabilizatorlar','Gimbal və stabilizasiya','Move3d',4,true,true,NOW(),NOW()),
  ('cat_aksesuarlar','Aksesuarlar','aksesuarlar','Tripod, monitor, batareya və digər','Box',5,true,true,NOW(),NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Brand" ("id","name","slug","isActive","createdAt","updatedAt") VALUES
  ('brand_canon','Canon','canon',true,NOW(),NOW()),
  ('brand_sony','Sony','sony',true,NOW(),NOW()),
  ('brand_nikon','Nikon','nikon',true,NOW(),NOW()),
  ('brand_dji','DJI','dji',true,NOW(),NOW()),
  ('brand_blackmagic','Blackmagic','blackmagic',true,NOW(),NOW()),
  ('brand_sigma','Sigma','sigma',true,NOW(),NOW()),
  ('brand_tamron','Tamron','tamron',true,NOW(),NOW()),
  ('brand_godox','Godox','godox',true,NOW(),NOW()),
  ('brand_aputure','Aputure','aputure',true,NOW(),NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Product" (
  "id","name","slug","sku","shortDesc","longDesc","dailyPrice","weeklyPrice","monthlyPrice","deposit",
  "showDailyPrice","showWeeklyPrice","showMonthlyPrice","status","sortOrder","isFeatured","isActive","isNew",
  "includedItems","usageRules","seoTitle","seoDescription","categoryId","brandId","createdAt","updatedAt"
) VALUES
('prod_r5','Canon EOS R5','canon-eos-r5','KZ-001','45MP full-frame mirrorless. 8K video və peşəkar foto.','Canon EOS R5 yüksək rezolyusiya və cinematic video imkanlarını birləşdirən flaqman kameradır.',50,280,900,500,true,true,true,'AVAILABLE',0,true,true,true,ARRAY['Kamera gövdəsi','2x batareya','Şarj cihazı','Kəmər','Çanta'],'Avadanlığı zədələməyin. Gecikmə halında əlavə gün haqqı tutulur. Depozit qaytarılır.','Canon EOS R5 kirayə | kamera.agency','45MP full-frame mirrorless. 8K video və peşəkar foto.','cat_fotoaparatlar','brand_canon',NOW(),NOW()),
('prod_a7s3','Sony A7S III','sony-a7s-iii','KZ-002','Low-light kralı. 4K 120p və exceptional ISO performansı.','Sony A7S III film və content creator-lar üçün low-light seçimidir.',55,300,950,550,true,true,true,'AVAILABLE',1,true,true,false,ARRAY['Kamera gövdəsi','2x batareya','Şarj','USB-C kabel'],'Avadanlığı zədələməyin.','Sony A7S III kirayə | kamera.agency','Low-light kralı. 4K 120p.','cat_fotoaparatlar','brand_sony',NOW(),NOW()),
('prod_fx3','Sony FX3','sony-fx3','KZ-003','Cinema Line kompakt kamera. S-Cinetone.','Sony FX3 peşəkar cinema workflow üçün kompakt kamera.',70,380,1200,700,true,true,true,'AVAILABLE',2,true,true,false,ARRAY['FX3 gövdə','XLR handle','2x batareya','Şarj'],'Avadanlığı zədələməyin.','Sony FX3 kirayə | kamera.agency','Cinema Line kompakt kamera.','cat_fotoaparatlar','brand_sony',NOW(),NOW()),
('prod_bmpcc','Blackmagic Pocket Cinema Camera 6K Pro','blackmagic-pocket-cinema-camera-6k-pro','KZ-004','6K BRAW, ND filterlər və peşəkar monitoring.','BMPCC 6K Pro film look və Blackmagic RAW ilə prodaksiya üçün.',65,350,1100,650,true,true,true,'AVAILABLE',3,true,true,false,ARRAY['Kamera','Batteries','Charger','Sunhood'],'Avadanlığı zədələməyin.','BMPCC 6K Pro kirayə | kamera.agency','6K BRAW cinema kamera.','cat_fotoaparatlar','brand_blackmagic',NOW(),NOW()),
('prod_rf2470','Canon RF 24-70mm f/2.8','canon-rf-24-70mm-f-2-8','KZ-005','Peşəkar standard zoom.','RF 24-70mm f/2.8 L IS USM studio və event üçün əsas işçi linzadır.',35,180,NULL,300,true,true,false,'AVAILABLE',4,true,true,false,ARRAY['Linza','Kapaklar','Hood','Çanta'],'Avadanlığı zədələməyin.','Canon RF 24-70 kirayə | kamera.agency','Peşəkar standard zoom.','cat_linzalar','brand_canon',NOW(),NOW()),
('prod_rf70200','Canon RF 70-200mm f/2.8','canon-rf-70-200mm-f-2-8','KZ-006','Kompakt tele zoom.','RF 70-200mm f/2.8 peşəkar telefoto zoom.',40,200,NULL,350,true,true,false,'AVAILABLE',5,true,true,false,ARRAY['Linza','Hood','Tripod collar'],'Avadanlığı zədələməyin.','Canon RF 70-200 kirayə | kamera.agency','Kompakt tele zoom.','cat_linzalar','brand_canon',NOW(),NOW()),
('prod_sigma35','Sigma 35mm f/1.4','sigma-35mm-f-1-4','KZ-007','Art seriyası. Kəskin prime obyektiv.','Sigma 35mm f/1.4 Art — cinematic shallow depth.',25,130,NULL,200,true,true,false,'AVAILABLE',6,false,true,true,ARRAY['Linza','Kapaklar','Hood'],'Avadanlığı zədələməyin.','Sigma 35mm kirayə | kamera.agency','Art seriyası prime linza.','cat_linzalar','brand_sigma',NOW(),NOW()),
('prod_sony2470','Sony 24-70mm GM II','sony-24-70mm-gm-ii','KZ-008','G Master II — daha yüngül, daha sürətli AF.','Sony FE 24-70mm F2.8 GM II yeni nəsil standard zoom.',38,190,NULL,320,true,true,false,'AVAILABLE',7,true,true,false,ARRAY['Linza','Hood','Çanta'],'Avadanlığı zədələməyin.','Sony 24-70 GM II kirayə | kamera.agency','G Master II zoom.','cat_linzalar','brand_sony',NOW(),NOW()),
('prod_sl60','Godox SL60W','godox-sl60w','KZ-009','60W LED continuous işıq.','Godox SL60W studio və YouTube çəkilişləri üçün işıq.',15,70,NULL,80,true,true,false,'AVAILABLE',8,false,true,false,ARRAY['İşıq','Reflektor','Softbox','Stand'],'Avadanlığı zədələməyin.','Godox SL60W kirayə | kamera.agency','60W LED işıq.','cat_isiqlar','brand_godox',NOW(),NOW()),
('prod_vl150','Godox VL150','godox-vl150','KZ-010','150W Bowens LED.','VL150 outdoor və studio üçün yüksək çıxışlı LED.',25,120,NULL,150,true,true,false,'AVAILABLE',9,true,true,false,ARRAY['İşıq','Controller','Softbox','Stand'],'Avadanlığı zədələməyin.','Godox VL150 kirayə | kamera.agency','150W Bowens LED.','cat_isiqlar','brand_godox',NOW(),NOW()),
('prod_300d','Aputure 300D II','aputure-300d-ii','KZ-011','Industry standard 300W LED.','Aputure 300D Mark II — peşəkar film setlərinin əsas işığı.',45,220,NULL,300,true,true,false,'AVAILABLE',10,true,true,false,ARRAY['Light head','Ballast','Cable','Softbox'],'Avadanlığı zədələməyin.','Aputure 300D II kirayə | kamera.agency','300W LED işıq.','cat_isiqlar','brand_aputure',NOW(),NOW()),
('prod_rs3','DJI RS 3 Pro','dji-rs-3-pro','KZ-012','Peşəkar 3-axis gimbal.','DJI RS 3 Pro ağır cinema kameralar üçün stabildir.',40,200,NULL,350,true,true,false,'AVAILABLE',11,true,true,true,ARRAY['Gimbal','BG30 grip','Quick release','Çanta'],'Avadanlığı zədələməyin.','DJI RS 3 Pro kirayə | kamera.agency','Peşəkar gimbal.','cat_stabilizatorlar','brand_dji',NOW(),NOW()),
('prod_ronin','DJI Ronin-S','dji-ronin-s','KZ-013','Klassik single-handed gimbal.','Ronin-S DSLR və mirrorless üçün etibarlı stabilizasiya.',25,120,NULL,200,true,true,false,'AVAILABLE',12,false,true,false,ARRAY['Gimbal','Tripod','Charger','Case'],'Avadanlığı zədələməyin.','DJI Ronin-S kirayə | kamera.agency','Klassik gimbal.','cat_stabilizatorlar','brand_dji',NOW(),NOW()),
('prod_tripod','Tripod','tripod','KZ-014','Peşəkar video tripod + fluid head.','Stabil və hamar pan/tilt üçün peşəkar tripod.',10,45,NULL,50,true,true,false,'AVAILABLE',13,false,true,false,ARRAY['Tripod','Head','Bag'],'Avadanlığı zədələməyin.','Tripod kirayə | kamera.agency','Peşəkar video tripod.','cat_aksesuarlar','brand_sony',NOW(),NOW()),
('prod_mic','Wireless mikrofon','wireless-mikrofon','KZ-015','2.4GHz wireless lavaliere set.','Interview və reels üçün wireless mikrofon dəsti.',15,70,NULL,80,true,true,false,'AVAILABLE',14,false,true,false,ARRAY['Transmitter x2','Receiver','Lav mics','Case'],'Avadanlığı zədələməyin.','Wireless mikrofon kirayə | kamera.agency','Wireless lav mic set.','cat_aksesuarlar','brand_sony',NOW(),NOW()),
('prod_monitor','Monitor','monitor','KZ-016','7" HDMI field monitor.','Focus peaking, false color və waveform ilə field monitor.',20,90,NULL,120,true,true,false,'AVAILABLE',15,false,true,false,ARRAY['Monitor','Sunhood','HDMI cable','Battery plate'],'Avadanlığı zədələməyin.','Monitor kirayə | kamera.agency','7 inch field monitor.','cat_aksesuarlar','brand_blackmagic',NOW(),NOW()),
('prod_card','Memory card','memory-card','KZ-017','CFexpress / SD UHS-II yüksək sürətli kart.','8K və yüksək bitrate video üçün yaddaş kartı.',8,35,NULL,40,true,true,false,'AVAILABLE',16,false,true,false,ARRAY['Kart','Case'],'Avadanlığı zədələməyin.','Memory card kirayə | kamera.agency','Yüksək sürətli kart.','cat_aksesuarlar','brand_sony',NOW(),NOW()),
('prod_bag','Kamera çantası','kamera-cantasi','KZ-018','Sərt və yumşaq qoruyucu çanta.','Avadanlıqların daşınması üçün padded kamera çantası.',5,20,NULL,30,true,true,false,'AVAILABLE',17,false,true,false,ARRAY['Çanta','Rain cover'],'Avadanlığı zədələməyin.','Kamera çantası kirayə | kamera.agency','Padded kamera çantası.','cat_aksesuarlar','brand_canon',NOW(),NOW()),
('prod_vmount','V-Mount batareya','v-mount-batareya','KZ-019','High capacity V-Mount power.','Cinema kameralar və işıqlar üçün V-Mount batareya.',12,55,NULL,100,true,true,false,'AVAILABLE',18,false,true,false,ARRAY['Battery','Charger'],'Avadanlığı zədələməyin.','V-Mount batareya kirayə | kamera.agency','V-Mount power.','cat_aksesuarlar','brand_sony',NOW(),NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Specification" ("id","label","value","sortOrder","productId") VALUES
('spec_r5_1','Sensor','Full Frame 45MP',0,'prod_r5'),
('spec_r5_2','Video','8K RAW / 4K 120p',1,'prod_r5'),
('spec_r5_3','Mount','RF',2,'prod_r5'),
('spec_r5_4','Çəki','738 qram',3,'prod_r5'),
('spec_a7s3_1','Sensor','Full Frame 12.1MP',0,'prod_a7s3'),
('spec_a7s3_2','Video','4K 120p 10-bit',1,'prod_a7s3'),
('spec_a7s3_3','Mount','E-mount',2,'prod_a7s3'),
('spec_a7s3_4','ISO','80–409600',3,'prod_a7s3'),
('spec_fx3_1','Sensor','Full Frame',0,'prod_fx3'),
('spec_fx3_2','Video','4K 120p',1,'prod_fx3'),
('spec_fx3_3','Mount','E-mount',2,'prod_fx3'),
('spec_rf2470_1','Fokal','24-70mm',0,'prod_rf2470'),
('spec_rf2470_2','Diafraqma','f/2.8',1,'prod_rf2470'),
('spec_rf2470_3','Mount','RF',2,'prod_rf2470'),
('spec_rs3_1','Payload','4.5 kg',0,'prod_rs3'),
('spec_rs3_2','Axis','3-axis',1,'prod_rs3'),
('spec_rs3_3','Battery','~12 saat',2,'prod_rs3')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "ProductAccessory" ("id","productId","accessoryId") VALUES
('acc_r5_tripod','prod_r5','prod_tripod'),
('acc_r5_card','prod_r5','prod_card'),
('acc_r5_bag','prod_r5','prod_bag'),
('acc_r5_rf2470','prod_r5','prod_rf2470')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "RelatedProduct" ("id","productId","relatedProductId") VALUES
('rel_r5_a7s3','prod_r5','prod_a7s3'),
('rel_r5_fx3','prod_r5','prod_fx3'),
('rel_r5_rf2470','prod_r5','prod_rf2470')
ON CONFLICT ("id") DO NOTHING;

-- Parametrlər: yoxdursa əlavə et; admin dəyişibsə toxunma
INSERT INTO "SiteSetting" ("id","key","value","updatedAt") VALUES
('set_siteName','siteName',to_jsonb('kamera.agency'::text),NOW()),
('set_whatsappNumber','whatsappNumber',to_jsonb('+994501234567'::text),NOW()),
('set_whatsappTemplate','whatsappTemplate',to_jsonb(E'Salam. kamera.agency saytından yazıram.\n\n{name} modelinə baxdım.\n{priceType} qiymət: {price}\nİstədiyim tarix: {dates}\nMəhsul linki: {url}\n\nBu avadanlığı kirayə götürmək istəyirəm. Zəhmət olmasa, həmin tarixlərdə boş olub-olmadığını bildirərdiniz.\n{note}'::text),NOW()),
('set_phone','phone',to_jsonb('+994501234567'::text),NOW()),
('set_email','email',to_jsonb('info@kamera.agency'::text),NOW()),
('set_address','address',to_jsonb('Bakı, Azərbaycan'::text),NOW()),
('set_workingHours','workingHours',to_jsonb('Hər gün 10:00 – 20:00'::text),NOW()),
('set_instagram','instagram',to_jsonb('https://instagram.com/kameraz.az'::text),NOW()),
('set_tiktok','tiktok',to_jsonb('https://tiktok.com/@kameraz.az'::text),NOW()),
('set_youtube','youtube',to_jsonb('https://youtube.com/@kameraz.az'::text),NOW()),
('set_footerText','footerText',to_jsonb('kamera.agency — peşəkar çəkiliş avadanlığı kirayəsi.'::text),NOW()),
('set_heroTitle','heroTitle',to_jsonb('KAMERA.AGENCY'::text),NOW()),
('set_heroSlogan','heroSlogan',to_jsonb('Çəkilişə hazır avadanlıq. Sən yalnız ideyanı gətir.'::text),NOW()),
('set_heroImage','heroImage',to_jsonb(''::text),NOW()),
('set_ctaText','ctaText',to_jsonb('Rezerv et'::text),NOW()),
('set_seoTitle','seoTitle',to_jsonb('kamera.agency — Foto və Video Avadanlıq Kirayəsi Bakı'::text),NOW()),
('set_seoDescription','seoDescription',to_jsonb('Bakıda peşəkar kamera, linza, işıq və stabilizator kirayəsi. WhatsApp ilə sürətli rezervasiya.'::text),NOW()),
('set_mapsUrl','mapsUrl',to_jsonb('https://maps.google.com/?q=Baku'::text),NOW()),
('set_announcementBar','announcementBar',to_jsonb(''::text),NOW()),
('set_maintenanceMode','maintenanceMode','false'::jsonb,NOW()),
('set_logo','logo',to_jsonb(''::text),NOW()),
('set_favicon','favicon',to_jsonb(''::text),NOW())
ON CONFLICT ("key") DO NOTHING;

-- Branding yenilə (kamera.agency) — WhatsApp şablonu həmişə düzgün olsun
UPDATE "SiteSetting" SET "value" = to_jsonb('kamera.agency'::text), "updatedAt" = NOW() WHERE "key" = 'siteName';
UPDATE "SiteSetting" SET "value" = to_jsonb(E'Salam. kamera.agency saytından yazıram.\n\n{name} modelinə baxdım.\n{priceType} qiymət: {price}\nİstədiyim tarix: {dates}\nMəhsul linki: {url}\n\nBu avadanlığı kirayə götürmək istəyirəm. Zəhmət olmasa, həmin tarixlərdə boş olub-olmadığını bildirərdiniz.\n{note}'::text), "updatedAt" = NOW() WHERE "key" = 'whatsappTemplate';
UPDATE "SiteSetting" SET "value" = to_jsonb('Rezerv et'::text), "updatedAt" = NOW() WHERE "key" = 'ctaText';
UPDATE "SiteSetting" SET "value" = to_jsonb('KAMERA.AGENCY'::text), "updatedAt" = NOW() WHERE "key" = 'heroTitle';
UPDATE "SiteSetting" SET "value" = to_jsonb('kamera.agency — peşəkar çəkiliş avadanlığı kirayəsi.'::text), "updatedAt" = NOW() WHERE "key" = 'footerText';
UPDATE "SiteSetting" SET "value" = to_jsonb('info@kamera.agency'::text), "updatedAt" = NOW() WHERE "key" = 'email';
UPDATE "SiteSetting" SET "value" = to_jsonb('kamera.agency — Foto və Video Avadanlıq Kirayəsi Bakı'::text), "updatedAt" = NOW() WHERE "key" = 'seoTitle';

INSERT INTO "NavigationItem" ("id","label","href","sortOrder","isVisible","createdAt","updatedAt") VALUES
('nav_all','Hamısı','/avadanliqlar',0,true,NOW(),NOW()),
('nav_foto','Fotoaparatlar','/kateqoriya/fotoaparatlar',1,true,NOW(),NOW()),
('nav_linza','Linzalar','/kateqoriya/linzalar',2,true,NOW(),NOW()),
('nav_isiq','İşıqlar','/kateqoriya/isiqlar',3,true,NOW(),NOW()),
('nav_stab','Stabilizatorlar','/kateqoriya/stabilizatorlar',4,true,NOW(),NOW()),
('nav_aks','Aksesuarlar','/kateqoriya/aksesuarlar',5,true,NOW(),NOW()),
('nav_elaqe','Əlaqə','/elaqe',6,true,NOW(),NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "SocialLink" ("id","platform","url","sortOrder","isVisible","createdAt","updatedAt") VALUES
('soc_instagram','Instagram','https://instagram.com/kameraz.az',0,true,NOW(),NOW()),
('soc_tiktok','TikTok','https://tiktok.com/@kameraz.az',1,true,NOW(),NOW()),
('soc_youtube','YouTube','https://youtube.com/@kameraz.az',2,true,NOW(),NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "BookingDate" ("id","productId","startDate","endDate","note","createdAt","updatedAt")
VALUES ('book_r5_sample','prod_r5',CURRENT_DATE + 3,CURRENT_DATE + 5,'Nümunə rezervasiya',NOW(),NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "ContactMessage" ("id","name","email","phone","subject","message","status","createdAt","updatedAt")
VALUES ('msg_sample','Elvin Məmmədov','elvin@example.com','+994501112233','Canon R5 kirayə','Salam, gələn həftə üçün Canon R5 boşdurmu?','NEW',NOW(),NOW())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "ActivityLog" ("id","userId","action","entity","entityId","details","createdAt")
VALUES ('act_seed',NULL,'SEED','System',NULL,'{"message":"İlkin məlumatlar yükləndi"}'::jsonb,NOW())
ON CONFLICT ("id") DO NOTHING;

-- ===================== 5) STORAGE (şəkil yükləmə — Cloudinary lazım deyil) =====================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Public read product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin upload product images" ON storage.objects;
CREATE POLICY "Admin upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin update product images" ON storage.objects;
CREATE POLICY "Admin update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin delete product images" ON storage.objects;
CREATE POLICY "Admin delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- ===================== YOXLAMA =====================
SELECT
  (SELECT COUNT(*) FROM "Category" WHERE "deletedAt" IS NULL) AS categories,
  (SELECT COUNT(*) FROM "Brand" WHERE "deletedAt" IS NULL) AS brands,
  (SELECT COUNT(*) FROM "Product" WHERE "deletedAt" IS NULL) AS products,
  (SELECT COUNT(*) FROM "SiteSetting") AS settings,
  (SELECT COUNT(*) FROM "NavigationItem") AS nav,
  (SELECT "value" FROM "SiteSetting" WHERE "key" = 'siteName') AS site_name;
