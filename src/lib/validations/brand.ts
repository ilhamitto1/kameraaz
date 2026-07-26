import { z } from "zod";

export const brandSchema = z.object({
  name: z.string().trim().min(1, "Ad tələb olunur").max(100),
  slug: z
    .string()
    .trim()
    .min(1, "Slug tələb olunur")
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug yalnız kiçik hərf, rəqəm və tire ehtiva edə bilər"),
  logo: z.string().trim().url("Düzgün şəkil URL-i daxil edin").optional().or(z.literal("")).nullable(),
  isActive: z.boolean().default(true),
});

export const brandUpdateSchema = brandSchema.partial();

export type BrandInput = z.infer<typeof brandSchema>;
export type BrandUpdateInput = z.infer<typeof brandUpdateSchema>;
