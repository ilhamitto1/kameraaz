-- kamera.agency — WhatsApp şablonu + sayt adı
-- SQL Editor-də bir dəfə Run et

UPDATE "SiteSetting"
SET "value" = to_jsonb('kamera.agency'::text), "updatedAt" = NOW()
WHERE "key" = 'siteName';

UPDATE "SiteSetting"
SET "value" = to_jsonb(E'Salam. kamera.agency saytından yazıram.\n\n{name} modelinə baxdım.\n{priceType} qiymət: {price}\nİstədiyim tarix: {dates}\nMəhsul linki: {url}\n\nBu avadanlığı kirayə götürmək istəyirəm. Zəhmət olmasa, həmin tarixlərdə boş olub-olmadığını bildirərdiniz.\n{note}'::text),
    "updatedAt" = NOW()
WHERE "key" = 'whatsappTemplate';

UPDATE "SiteSetting"
SET "value" = to_jsonb('Rezerv et'::text), "updatedAt" = NOW()
WHERE "key" = 'ctaText';

UPDATE "SiteSetting"
SET "value" = to_jsonb('KAMERA.AGENCY'::text), "updatedAt" = NOW()
WHERE "key" = 'heroTitle';

UPDATE "SiteSetting"
SET "value" = to_jsonb('kamera.agency — peşəkar çəkiliş avadanlığı kirayəsi.'::text), "updatedAt" = NOW()
WHERE "key" = 'footerText';

UPDATE "SiteSetting"
SET "value" = to_jsonb('info@kamera.agency'::text), "updatedAt" = NOW()
WHERE "key" = 'email';

UPDATE "SiteSetting"
SET "value" = to_jsonb('kamera.agency — Foto və Video Avadanlıq Kirayəsi Bakı'::text), "updatedAt" = NOW()
WHERE "key" = 'seoTitle';

SELECT "key", "value" FROM "SiteSetting"
WHERE "key" IN ('siteName', 'whatsappTemplate', 'ctaText', 'whatsappNumber');
