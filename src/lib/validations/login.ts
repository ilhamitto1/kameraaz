import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email tələb olunur").email("Düzgün email daxil edin"),
  password: z.string().min(6, "Şifrə ən azı 6 simvol olmalıdır"),
});

export type LoginInput = z.infer<typeof loginSchema>;
