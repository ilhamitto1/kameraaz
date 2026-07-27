import { z } from "zod";

const availabilityStatuses = [
  "AVAILABLE",
  "RESERVED",
  "RENTED",
  "SERVICE",
  "UNAVAILABLE",
] as const;

export const specificationSchema = z.object({
  label: z.string().trim().min(1, "Xüsusiyyət adı tələb olunur").max(100),
  value: z.string().trim().min(1, "Dəyər tələb olunur").max(300),
  sortOrder: z.number().int().default(0),
});

export const productImageSchema = z.object({
  url: z.string().trim().min(1, "Şəkil URL-i tələb olunur"),
  alt: z.string().trim().max(200).optional().or(z.literal("")),
  sortOrder: z.number().int().default(0),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "Ad ən azı 2 simvol olmalıdır").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Slug tələb olunur")
    .max(220)
    .regex(/^[a-z0-9-]+$/, "Slug yalnız kiçik hərf, rəqəm və tire ehtiva edə bilər"),
  sku: z.string().trim().max(100).optional().or(z.literal("")).nullable(),
  shortDesc: z.string().trim().max(500).optional().or(z.literal("")).nullable(),
  longDesc: z.string().trim().max(10000).optional().or(z.literal("")).nullable(),
  dailyPrice: z.coerce.number().nonnegative("Qiymət mənfi ola bilməz").optional().nullable(),
  weeklyPrice: z.coerce.number().nonnegative("Qiymət mənfi ola bilməz").optional().nullable(),
  monthlyPrice: z.coerce.number().nonnegative("Qiymət mənfi ola bilməz").optional().nullable(),
  deposit: z.coerce.number().nonnegative("Depozit mənfi ola bilməz").optional().nullable(),
  showDailyPrice: z.boolean().default(true),
  showWeeklyPrice: z.boolean().default(true),
  showMonthlyPrice: z.boolean().default(false),
  mainImage: z.string().trim().max(500).optional().or(z.literal("")).nullable(),
  status: z.enum(availabilityStatuses).default("AVAILABLE"),
  badge: z.string().trim().max(50).optional().or(z.literal("")).nullable(),
  sortOrder: z.number().int().default(0),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isNew: z.boolean().default(false),
  includedItems: z.array(z.string().trim().min(1)).default([]),
  usageRules: z.string().trim().max(5000).optional().or(z.literal("")).nullable(),
  seoTitle: z.string().trim().max(200).optional().or(z.literal("")).nullable(),
  seoDescription: z.string().trim().max(500).optional().or(z.literal("")).nullable(),
  categoryId: z.string().min(1, "Kateqoriya tələb olunur"),
  brandId: z.string().min(1, "Brend tələb olunur"),
  images: z.array(productImageSchema).default([]),
  specifications: z.array(specificationSchema).default([]),
  accessoryIds: z.array(z.string()).default([]),
  relatedProductIds: z.array(z.string()).default([]),
});

export const productUpdateSchema = productSchema.partial();

export type ProductInput = z.infer<typeof productSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type SpecificationInput = z.infer<typeof specificationSchema>;
export type ProductImageInput = z.infer<typeof productImageSchema>;
