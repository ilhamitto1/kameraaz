# Kameraz.com

Premium foto/video avadanlıq kirayə kataloqu — Next.js 15, TypeScript, Prisma, PostgreSQL.

## Tələblər

- Node.js 20+
- Docker (PostgreSQL üçün) **və ya** öz PostgreSQL-iniz

## Quraşdırma

```bash
# 1. Asılılıqlar
npm install

# 2. Environment
cp .env.example .env
# DATABASE_URL və AUTH_SECRET-i düzəldin

# 3. PostgreSQL (Docker)
docker compose up -d
# Default: localhost:5433 (lokal Postgres 5432 ilə toqquşmasın deyə)

# 4. Migration + seed
npx prisma migrate deploy
npm run db:seed

# 5. Development
npm run dev
```

Sayt: http://localhost:3000  
Admin: http://localhost:3000/admin/login

### Default admin

| Sahə | Dəyər |
|------|--------|
| Email | `admin@kameraz.com` |
| Şifrə | `KamerazAdmin2026!` |

`.env` içində `ADMIN_EMAIL` / `ADMIN_PASSWORD` ilə dəyişə bilərsiniz (seed yenidən işləyəndə).

## Əsas əmrlər

```bash
npm run dev          # Development (Turbopack)
npm run build        # Production build
npm start            # Production server
npm run db:migrate   # prisma migrate dev
npm run db:seed      # Seed data
npm run db:studio    # Prisma Studio
npm run db:reset     # DB reset + migrate + seed
```

## Environment (`.env.example`)

- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — NextAuth secret (uzun random string)
- `NEXTAUTH_URL` / `AUTH_URL` — məs. `http://localhost:3000`
- `NEXT_PUBLIC_SITE_URL` — canonical URL
- `UPLOAD_PROVIDER` — `local` və ya Cloudinary (`CLOUDINARY_*`)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` — seed admin

## Deployment

1. PostgreSQL yaradın (Neon, Supabase, Railway, Digan Docker).
2. Env dəyişənlərini production-da təyin edin (`AUTH_SECRET` mütləq dəyişsin).
3. `npx prisma migrate deploy && npm run db:seed`
4. `npm run build && npm start` və ya Vercel/Docker.

Vercel üçün: build command `prisma generate && next build`, postinstall artıq `prisma generate` edir.

## Fayl strukturu (əsas)

```
prisma/schema.prisma      # DB modelləri
prisma/seed.ts            # Nümunə məlumatlar
src/actions/              # Server Actions (CRUD, analytics)
src/app/(site)/           # Public səhifələr
src/app/admin/            # Admin panel
src/components/           # UI, layout, products, admin
src/lib/                  # auth, prisma, whatsapp, i18n, validations
```

## Əsas komponentlər

| Komponent | Rol |
|-----------|-----|
| `Navbar` | Floating cinematic control panel + aperture mega menu |
| `CustomCursor` | Desktop fokus/lens cursor |
| `ProductCard` | Asimetrik kart, tilt, REC, timecode qiymət |
| `ProductDetailClient` | Qalereya, tarix, WhatsApp mesaj |
| `ProductForm` | Admin məhsul CRUD + upload |
| `SettingsForm` | WhatsApp, hero, SEO parametrləri |

## WhatsApp

Admin → Parametrlər → nömrə və şablon. Placeholder-lər: `{name}`, `{price}`, `{priceType}`, `{url}`, `{dates}`, `{note}`.

## Qeyd

Docker Postgres host portu **5433**-dür (`docker-compose.yml`). Lokal Postgres 5432-də işləyirsə conflict olmaz.
