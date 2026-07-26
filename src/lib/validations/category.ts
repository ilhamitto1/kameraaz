import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Ad tələb olunur").max(100),
  slug: z
    .string()
    .trim()
    .min(1, "Slug tələb olunur")
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug yalnız kiçik hərf, rəqəm və tire ehtiva edə bilər"),
  description: z.string().trim().max(2000).optional().or(z.literal("")).nullable(),
  image: z.string().trim().url("Düzgün şəkil URL-i daxil edin").optional().or(z.literal("")).nullable(),
  icon: z.string().trim().max(100).optional().or(z.literal("")).nullable(),
  sortOrder: z.number().int().default(0),
  isVisible: z.boolean().default(true),
  showInNav: z.boolean().default(true),
});

export const categoryUpdateSchema = categorySchema.partial();

export type CategoryInput = z.infer<typeof categorySchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
