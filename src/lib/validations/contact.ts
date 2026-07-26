import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Ad ən azı 2 simvol olmalıdır").max(100),
  email: z.string().trim().min(1, "Email tələb olunur").email("Düzgün email daxil edin"),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+0-9\s()-]*$/, "Düzgün telefon nömrəsi daxil edin")
    .optional()
    .or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Mesaj ən azı 10 simvol olmalıdır").max(5000),
  honeypot: z.string().max(0, "Spam aşkarlandı").optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;
