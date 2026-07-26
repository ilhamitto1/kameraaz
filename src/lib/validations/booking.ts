import { z } from "zod";

export const bookingDateSchema = z
  .object({
    productId: z.string().min(1, "Məhsul tələb olunur"),
    startDate: z.coerce.date({ message: "Başlanğıc tarixi tələb olunur" }),
    endDate: z.coerce.date({ message: "Bitmə tarixi tələb olunur" }),
    note: z.string().trim().max(500).optional().or(z.literal("")),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "Bitmə tarixi başlanğıc tarixindən əvvəl ola bilməz",
    path: ["endDate"],
  });

export const bookingDateUpdateSchema = z
  .object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    note: z.string().trim().max(500).optional().or(z.literal("")),
  })
  .refine(
    (data) => !data.startDate || !data.endDate || data.endDate >= data.startDate,
    { message: "Bitmə tarixi başlanğıc tarixindən əvvəl ola bilməz", path: ["endDate"] },
  );

export type BookingDateInput = z.infer<typeof bookingDateSchema>;
export type BookingDateUpdateInput = z.infer<typeof bookingDateUpdateSchema>;
