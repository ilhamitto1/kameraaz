-- kamera.agency — mövcud məhsul SEO başlıqlarını düzəlt (TRUNCATE YOXDUR)
-- SQL Editor → Run (bir dəfə kifayətdir)

UPDATE "Product"
SET
  "seoTitle" = REPLACE(REPLACE("seoTitle", 'Kameraz.com', 'kamera.agency'), 'Kameraz', 'kamera.agency'),
  "updatedAt" = NOW()
WHERE "seoTitle" ILIKE '%kameraz%';

UPDATE "Product"
SET
  "seoDescription" = REPLACE(REPLACE("seoDescription", 'Kameraz.com', 'kamera.agency'), 'Kameraz', 'kamera.agency'),
  "updatedAt" = NOW()
WHERE "seoDescription" ILIKE '%kameraz%';

-- Nəticə
SELECT "slug", "seoTitle" FROM "Product"
WHERE "seoTitle" IS NOT NULL
ORDER BY "sortOrder"
LIMIT 25;
