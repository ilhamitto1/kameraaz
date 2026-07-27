-- =============================================================================
-- KAMERAZ.COM — SUPABASE SQL (ADDIM 2)
-- 01-schema.sql işlədikdən SONRA bu faylı SQL Editor-də RUN edin.
-- Mövcud məlumatları yeniləyir (slug əsasında upsert).
-- =============================================================================

-- ---- Kateqoriyalar ----
INSERT INTO "Category" ("id","name","slug","description","icon","sortOrder","isVisible","showInNav","createdAt","updatedAt")
VALUES
  ('cat_fotoaparatlar','Fotoaparatlar','fotoaparatlar','Peşəkar foto və hybrid kameralar','Camera',1,true,true,NOW(),NOW()),
  ('cat_linzalar','Linzalar','linzalar','Prime və zoom obyektivlər','Aperture',2,true,true,NOW(),NOW()),
  ('cat_isiqlar','İşıqlar','isiqlar','LED və continuous işıq sistemləri','Lamp',3,true,true,NOW(),NOW()),
  ('cat_stabilizatorlar','Stabilizatorlar','stabilizatorlar','Gimbal və stabilizasiya','Move3d',4,true,true,NOW(),NOW()),
  ('cat_aksesuarlar','Aksesuarlar','aksesuarlar','Tripod, monitor, batareya və digər','Box',5,true,true,NOW(),NOW())
ON CONFLICT ("slug") DO UPDATE SET
  "name"=EXCLUDED."name","description"=EXCLUDED."description","icon"=EXCLUDED."icon",
  "sortOrder"=EXCLUDED."sortOrder","isVisible"=true,"showInNav"=true,"updatedAt"=NOW();

-- ---- Markalar ----
INSERT INTO "Brand" ("id","name","slug","isActive","createdAt","updatedAt")
VALUES
  ('brand_canon','Canon','canon',true,NOW(),NOW()),
  ('brand_sony','Sony','sony',true,NOW(),NOW()),
  ('brand_nikon','Nikon','nikon',true,NOW(),NOW()),
  ('brand_dji','DJI','dji',true,NOW(),NOW()),
  ('brand_blackmagic','Blackmagic','blackmagic',true,NOW(),NOW()),
  ('brand_sigma','Sigma','sigma',true,NOW(),NOW()),
  ('brand_tamron','Tamron','tamron',true,NOW(),NOW()),
  ('brand_godox','Godox','godox',true,NOW(),NOW()),
  ('brand_aputure','Aputure','aputure',true,NOW(),NOW())
ON CONFLICT ("slug") DO UPDATE SET "name"=EXCLUDED."name","isActive"=true,"updatedAt"=NOW();

-- ---- Məhsullar (19 ədəd) ----
INSERT INTO "Product" (
  "id","name","slug","sku","shortDesc","longDesc","dailyPrice","weeklyPrice","monthlyPrice","deposit",
  "showDailyPrice","showWeeklyPrice","showMonthlyPrice","status","sortOrder","isFeatured","isActive","isNew",
  "includedItems","usageRules","seoTitle","seoDescription","categoryId","brandId","createdAt","updatedAt"
) VALUES
('prod_r5','Canon EOS R5','canon-eos-r5','KZ-001','45MP full-frame mirrorless. 8K video və peşəkar foto.','Canon EOS R5 yüksək rezolyusiya və cinematic video imkanlarını birləşdirən flaqman kameradır.',50,280,900,500,true,true,true,'AVAILABLE',0,true,true,true,ARRAY['Kamera gövdəsi','2x batareya','Şarj cihazı','Kəmər','Çanta'],'Avadanlığı zədələməyin. Gecikmə halında əlavə gün haqqı tutulur.','Canon EOS R5 kirayə | Kameraz.com','45MP full-frame mirrorless. 8K video və peşəkar foto.','cat_fotoaparatlar','brand_canon',NOW(),NOW()),
('prod_a7s3','Sony A7S III','sony-a7s-iii','KZ-002','Low-light kralı. 4K 120p və exceptional ISO performansı.','Sony A7S III film və content creator-lar üçün low-light seçimidir.',55,300,950,550,true,true,true,'AVAILABLE',1,true,true,false,ARRAY['Kamera gövdəsi','2x batareya','Şarj','USB-C kabel'],'Avadanlığı zədələməyin.','Sony A7S III kirayə | Kameraz.com','Low-light kralı. 4K 120p.', 'cat_fotoaparatlar','brand_sony',NOW(),NOW()),
('prod_fx3','Sony FX3','sony-fx3','KZ-003','Cinema Line kompakt kamera. S-Cinetone.','Sony FX3 peşəkar cinema workflow üçün kompakt kamera.',70,380,1200,700,true,true,true,'AVAILABLE',2,true,true,false,ARRAY['FX3 gövdə','XLR handle','2x batareya','Şarj'],'Avadanlığı zədələməyin.','Sony FX3 kirayə | Kameraz.com','Cinema Line kompakt kamera.','cat_fotoaparatlar','brand_sony',NOW(),NOW()),
('prod_bmpcc','Blackmagic Pocket Cinema Camera 6K Pro','blackmagic-pocket-cinema-camera-6k-pro','KZ-004','6K BRAW, ND filterlər və peşəkar monitoring.','BMPCC 6K Pro film look və Blackmagic RAW ilə prodaksiya üçün.',65,350,1100,650,true,true,true,'AVAILABLE',3,true,true,false,ARRAY['Kamera','Batteries','Charger','Sunhood'],'Avadanlığı zədələməyin.','BMPCC 6K Pro kirayə | Kameraz.com','6K BRAW cinema kamera.','cat_fotoaparatlar','brand_blackmagic',NOW(),NOW()),
('prod_rf2470','Canon RF 24-70mm f/2.8','canon-rf-24-70mm-f-2-8','KZ-005','Peşəkar standard zoom.','RF 24-70mm f/2.8 L IS USM studio və event üçün əsas işçi linzadır.',35,180,NULL,300,true,true,false,'AVAILABLE',4,true,true,false,ARRAY['Linza','Kapaklar','Hood','Çanta'],'Avadanlığı zədələməyin.','Canon RF 24-70 kirayə | Kameraz.com','Peşəkar standard zoom.','cat_linzalar','brand_canon',NOW(),NOW()),
('prod_rf70200','Canon RF 70-200mm f/2.8','canon-rf-70-200mm-f-2-8','KZ-006','Kompakt tele zoom.','RF 70-200mm f/2.8 peşəkar telefoto zoom.',40,200,NULL,350,true,true,false,'AVAILABLE',5,true,true,false,ARRAY['Linza','Hood','Tripod collar'],'Avadanlığı zədələməyin.','Canon RF 70-200 kirayə | Kameraz.com','Kompakt tele zoom.','cat_linzalar','brand_canon',NOW(),NOW()),
('prod_sigma35','Sigma 35mm f/1.4','sigma-35mm-f-1-4','KZ-007','Art seriyası. Kəskin prime obyektiv.','Sigma 35mm f/1.4 Art — cinematic shallow depth.',25,130,NULL,200,true,true,false,'AVAILABLE',6,false,true,true,ARRAY['Linza','Kapaklar','Hood'],'Avadanlığı zədələməyin.','Sigma 35mm kirayə | Kameraz.com','Art seriyası prime linza.','cat_linzalar','brand_sigma',NOW(),NOW()),
('prod_sony2470','Sony 24-70mm GM II','sony-24-70mm-gm-ii','KZ-008','G Master II — daha yüngül, daha sürətli AF.','Sony FE 24-70mm F2.8 GM II yeni nəsil standard zoom.',38,190,NULL,320,true,true,false,'AVAILABLE',7,true,true,false,ARRAY['Linza','Hood','Çanta'],'Avadanlığı zədələməyin.','Sony 24-70 GM II kirayə | Kameraz.com','G Master II zoom.','cat_linzalar','brand_sony',NOW(),NOW()),
('prod_sl60','Godox SL60W','godox-sl60w','KZ-009','60W LED continuous işıq.','Godox SL60W studio və YouTube çəkilişləri üçün işıq.',15,70,NULL,80,true,true,false,'AVAILABLE',8,false,true,false,ARRAY['İşıq','Reflektor','Softbox','Stand'],'Avadanlığı zədələməyin.','Godox SL60W kirayə | Kameraz.com','60W LED işıq.','cat_isiqlar','brand_godox',NOW(),NOW()),
('prod_vl150','Godox VL150','godox-vl150','KZ-010','150W Bowens LED.','VL150 outdoor və studio üçün yüksək çıxışlı LED.',25,120,NULL,150,true,true,false,'AVAILABLE',9,true,true,false,ARRAY['İşıq','Controller','Softbox','Stand'],'Avadanlığı zədələməyin.','Godox VL150 kirayə | Kameraz.com','150W Bowens LED.','cat_isiqlar','brand_godox',NOW(),NOW()),
('prod_300d','Aputure 300D II','aputure-300d-ii','KZ-011','Industry standard 300W LED.','Aputure 300D Mark II — peşəkar film setlərinin əsas işığı.',45,220,NULL,300,true,true,false,'AVAILABLE',10,true,true,false,ARRAY['Light head','Ballast','Cable','Softbox'],'Avadanlığı zədələməyin.','Aputure 300D II kirayə | Kameraz.com','300W LED işıq.','cat_isiqlar','brand_aputure',NOW(),NOW()),
('prod_rs3','DJI RS 3 Pro','dji-rs-3-pro','KZ-012','Peşəkar 3-axis gimbal.','DJI RS 3 Pro ağır cinema kameralar üçün stabildir.',40,200,NULL,350,true,true,false,'AVAILABLE',11,true,true,true,ARRAY['Gimbal','BG30 grip','Quick release','Çanta'],'Avadanlığı zədələməyin.','DJI RS 3 Pro kirayə | Kameraz.com','Peşəkar gimbal.','cat_stabilizatorlar','brand_dji',NOW(),NOW()),
('prod_ronin','DJI Ronin-S','dji-ronin-s','KZ-013','Klassik single-handed gimbal.','Ronin-S DSLR və mirrorless üçün etibarlı stabilizasiya.',25,120,NULL,200,true,true,false,'AVAILABLE',12,false,true,false,ARRAY['Gimbal','Tripod','Charger','Case'],'Avadanlığı zədələməyin.','DJI Ronin-S kirayə | Kameraz.com','Klassik gimbal.','cat_stabilizatorlar','brand_dji',NOW(),NOW()),
('prod_tripod','Tripod','tripod','KZ-014','Peşəkar video tripod + fluid head.','Stabil və hamar pan/tilt üçün peşəkar tripod.',10,45,NULL,50,true,true,false,'AVAILABLE',13,false,true,false,ARRAY['Tripod','Head','Bag'],'Avadanlığı zədələməyin.','Tripod kirayə | Kameraz.com','Peşəkar video tripod.','cat_aksesuarlar','brand_sony',NOW(),NOW()),
('prod_mic','Wireless mikrofon','wireless-mikrofon','KZ-015','2.4GHz wireless lavaliere set.','Interview və reels üçün wireless mikrofon dəsti.',15,70,NULL,80,true,true,false,'AVAILABLE',14,false,true,false,ARRAY['Transmitter x2','Receiver','Lav mics','Case'],'Avadanlığı zədələməyin.','Wireless mikrofon kirayə | Kameraz.com','Wireless lav mic set.','cat_aksesuarlar','brand_sony',NOW(),NOW()),
('prod_monitor','Monitor','monitor','KZ-016','7" HDMI field monitor.','Focus peaking, false color və waveform ilə field monitor.',20,90,NULL,120,true,true,false,'AVAILABLE',15,false,true,false,ARRAY['Monitor','Sunhood','HDMI cable','Battery plate'],'Avadanlığı zədələməyin.','Monitor kirayə | Kameraz.com','7 inch field monitor.','cat_aksesuarlar','brand_blackmagic',NOW(),NOW()),
('prod_card','Memory card','memory-card','KZ-017','CFexpress / SD UHS-II yüksək sürətli kart.','8K və yüksək bitrate video üçün yaddaş kartı.',8,35,NULL,40,true,true,false,'AVAILABLE',16,false,true,false,ARRAY['Kart','Case'],'Avadanlığı zədələməyin.','Memory card kirayə | Kameraz.com','Yüksək sürətli kart.','cat_aksesuarlar','brand_sony',NOW(),NOW()),
('prod_bag','Kamera çantası','kamera-cantasi','KZ-018','Sərt və yumşaq qoruyucu çanta.','Avadanlıqların daşınması üçün padded kamera çantası.',5,20,NULL,30,true,true,false,'AVAILABLE',17,false,true,false,ARRAY['Çanta','Rain cover'],'Avadanlığı zədələməyin.','Kamera çantası kirayə | Kameraz.com','Padded kamera çantası.','cat_aksesuarlar','brand_canon',NOW(),NOW()),
('prod_vmount','V-Mount batareya','v-mount-batareya','KZ-019','High capacity V-Mount power.','Cinema kameralar və işıqlar üçün V-Mount batareya.',12,55,NULL,100,true,true,false,'AVAILABLE',18,false,true,false,ARRAY['Battery','Charger'],'Avadanlığı zədələməyin.','V-Mount batareya kirayə | Kameraz.com','V-Mount power.','cat_aksesuarlar','brand_sony',NOW(),NOW())
ON CONFLICT ("slug") DO UPDATE SET
  "name"=EXCLUDED."name","dailyPrice"=EXCLUDED."dailyPrice","weeklyPrice"=EXCLUDED."weeklyPrice",
  "monthlyPrice"=EXCLUDED."monthlyPrice","deposit"=EXCLUDED."deposit","shortDesc"=EXCLUDED."shortDesc",
  "longDesc"=EXCLUDED."longDesc","isFeatured"=EXCLUDED."isFeatured","isActive"=true,"updatedAt"=NOW();

-- ---- Xüsusiyyətlər (Canon R5 nümunəsi + əsas məhsullar) ----
DELETE FROM "Specification" WHERE "productId" IN ('prod_r5','prod_a7s3','prod_fx3');
INSERT INTO "Specification" ("id","label","value","sortOrder","productId") VALUES
('spec_r5_1','Sensor','Full Frame 45MP',0,'prod_r5'),
('spec_r5_2','Video','8K RAW / 4K 120p',1,'prod_r5'),
('spec_r5_3','Mount','RF',2,'prod_r5'),
('spec_r5_4','Çəki','738 qram',3,'prod_r5'),
('spec_a7s3_1','Sensor','Full Frame 12.1MP',0,'prod_a7s3'),
('spec_a7s3_2','Video','4K 120p 10-bit',1,'prod_a7s3'),
('spec_a7s3_3','Mount','E-mount',2,'prod_a7s3'),
('spec_fx3_1','Sensor','Full Frame',0,'prod_fx3'),
('spec_fx3_2','Video','4K 120p',1,'prod_fx3'),
('spec_fx3_3','Mount','E-mount',2,'prod_fx3');

-- ---- Sayt parametrləri ----
INSERT INTO "SiteSetting" ("id","key","value","updatedAt") VALUES
('set_siteName','siteName',to_jsonb('Kameraz.com'::text),NOW()),
('set_whatsappNumber','whatsappNumber',to_jsonb('+994501234567'::text),NOW()),
('set_whatsappTemplate','whatsappTemplate',to_jsonb('Salam. Kameraz.com saytında {name} modelinə baxdım.

{priceType} qiymət: {price}
İstədiyim tarix: {dates}
Məhsul linki: {url}

Bu avadanlığı kirayə götürmək istəyirəm. Zəhmət olmasa, həmin tarixlərdə boş olub-olmadığını bildirərdiniz.
{note}'::text),NOW()),
('set_phone','phone',to_jsonb('+994501234567'::text),NOW()),
('set_email','email',to_jsonb('info@kameraz.com'::text),NOW()),
('set_address','address',to_jsonb('Bakı, Azərbaycan'::text),NOW()),
('set_workingHours','workingHours',to_jsonb('Hər gün 10:00 – 20:00'::text),NOW()),
('set_instagram','instagram',to_jsonb('https://instagram.com/kameraz.az'::text),NOW()),
('set_tiktok','tiktok',to_jsonb('https://tiktok.com/@kameraz.az'::text),NOW()),
('set_youtube','youtube',to_jsonb('https://youtube.com/@kameraz.az'::text),NOW()),
('set_footerText','footerText',to_jsonb('Kameraz.com — peşəkar çəkiliş avadanlığı kirayəsi.'::text),NOW()),
('set_heroTitle','heroTitle',to_jsonb('KAMERAZ'::text),NOW()),
('set_heroSlogan','heroSlogan',to_jsonb('Çəkilişə hazır avadanlıq. Sən yalnız ideyanı gətir.'::text),NOW()),
('set_heroImage','heroImage',to_jsonb(''::text),NOW()),
('set_ctaText','ctaText',to_jsonb('WhatsApp ilə əlaqə'::text),NOW()),
('set_seoTitle','seoTitle',to_jsonb('Kameraz.com — Foto və Video Avadanlıq Kirayəsi Bakı'::text),NOW()),
('set_seoDescription','seoDescription',to_jsonb('Bakıda peşəkar kamera, linza, işıq və stabilizator kirayəsi. WhatsApp ilə sürətli rezervasiya.'::text),NOW()),
('set_mapsUrl','mapsUrl',to_jsonb('https://maps.google.com/?q=Baku'::text),NOW()),
('set_announcementBar','announcementBar',to_jsonb(''::text),NOW()),
('set_maintenanceMode','maintenanceMode',to_jsonb(false),NOW()),
('set_logo','logo',to_jsonb(''::text),NOW()),
('set_favicon','favicon',to_jsonb(''::text),NOW())
ON CONFLICT ("key") DO UPDATE SET "value"=EXCLUDED."value","updatedAt"=NOW();

-- ---- Navbar ----
DELETE FROM "NavigationItem";
INSERT INTO "NavigationItem" ("id","label","href","sortOrder","isVisible","createdAt","updatedAt") VALUES
('nav_all','Hamısı','/avadanliqlar',0,true,NOW(),NOW()),
('nav_foto','Fotoaparatlar','/kateqoriya/fotoaparatlar',1,true,NOW(),NOW()),
('nav_linza','Linzalar','/kateqoriya/linzalar',2,true,NOW(),NOW()),
('nav_isiq','İşıqlar','/kateqoriya/isiqlar',3,true,NOW(),NOW()),
('nav_stab','Stabilizatorlar','/kateqoriya/stabilizatorlar',4,true,NOW(),NOW()),
('nav_aks','Aksesuarlar','/kateqoriya/aksesuarlar',5,true,NOW(),NOW()),
('nav_elaqe','Əlaqə','/elaqe',6,true,NOW(),NOW());

-- ---- Sosial linklər ----
DELETE FROM "SocialLink";
INSERT INTO "SocialLink" ("id","platform","url","sortOrder","isVisible","createdAt","updatedAt") VALUES
('soc_instagram','Instagram','https://instagram.com/kameraz.az',0,true,NOW(),NOW()),
('soc_tiktok','TikTok','https://tiktok.com/@kameraz.az',1,true,NOW(),NOW()),
('soc_youtube','YouTube','https://youtube.com/@kameraz.az',2,true,NOW(),NOW());

-- ---- Nümunə rezervasiya (Canon R5) ----
DELETE FROM "BookingDate" WHERE "productId"='prod_r5';
INSERT INTO "BookingDate" ("id","productId","startDate","endDate","note","createdAt","updatedAt")
VALUES ('book_r5_sample','prod_r5',CURRENT_DATE + 3,CURRENT_DATE + 5,'Nümunə rezervasiya',NOW(),NOW());

-- ---- Nümunə mesaj ----
INSERT INTO "ContactMessage" ("id","name","email","phone","subject","message","status","createdAt","updatedAt")
SELECT 'msg_sample','Elvin Məmmədov','elvin@example.com','+994501112233','Canon R5 kirayə','Salam, gələn həftə üçün Canon R5 boşdurmu?','NEW',NOW(),NOW()
WHERE NOT EXISTS (SELECT 1 FROM "ContactMessage" LIMIT 1);
