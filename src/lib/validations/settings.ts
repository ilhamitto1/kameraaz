import { z } from "zod";

export const settingsSchema = z.object({
  siteName: z.string().trim().min(1).max(100),
  whatsappNumber: z
    .string()
    .trim()
    .min(1, "WhatsApp nömrəsi tələb olunur")
    .regex(/^\+?[0-9\s()-]+$/, "Düzgün nömrə daxil edin"),
  whatsappTemplate: z.string().trim().min(1).max(2000),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  email: z.string().trim().email("Düzgün email daxil edin").optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  workingHours: z.string().trim().max(200).optional().or(z.literal("")),
  instagram: z.string().trim().max(300).optional().or(z.literal("")),
  tiktok: z.string().trim().max(300).optional().or(z.literal("")),
  youtube: z.string().trim().max(300).optional().or(z.literal("")),
  footerText: z.string().trim().max(1000).optional().or(z.literal("")),
  heroTitle: z.string().trim().max(200).optional().or(z.literal("")),
  heroSlogan: z.string().trim().max(300).optional().or(z.literal("")),
  heroImage: z.string().trim().max(500).optional().or(z.literal("")),
  ctaText: z.string().trim().max(100).optional().or(z.literal("")),
  seoTitle: z.string().trim().max(200).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(500).optional().or(z.literal("")),
  mapsUrl: z.string().trim().max(1000).optional().or(z.literal("")),
  announcementBar: z.string().trim().max(300).optional().or(z.literal("")),
  maintenanceMode: z.boolean().default(false),
  logo: z.string().trim().max(500).optional().or(z.literal("")),
  favicon: z.string().trim().max(500).optional().or(z.literal("")),
});

export const settingsUpdateSchema = z.object({
  key: z.string().min(1, "Açar tələb olunur"),
  value: z.unknown(),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;
