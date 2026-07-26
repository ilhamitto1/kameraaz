import type {
  AvailabilityStatus,
  Brand,
  Category,
  MessageStatus,
  PriceType,
  Product,
  ProductImage,
  Specification,
} from "@prisma/client";

export type { AvailabilityStatus, MessageStatus, PriceType };

/** Session user shape exposed via NextAuth session/JWT callbacks. */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

/** Product row including its most commonly joined relations. */
export type ProductWithRelations = Product & {
  category: Category;
  brand: Brand;
  images: ProductImage[];
  specifications: Specification[];
};

/** Serialized product safe to pass from server components to client components. */
export type SerializedProduct = Omit<
  ProductWithRelations,
  "dailyPrice" | "weeklyPrice" | "monthlyPrice" | "deposit"
> & {
  dailyPrice: number | null;
  weeklyPrice: number | null;
  monthlyPrice: number | null;
  deposit: number | null;
};

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductFilters {
  categorySlug?: string;
  brandSlug?: string;
  status?: AvailabilityStatus;
  isFeatured?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price-asc" | "price-desc" | "popular";
  page?: number;
  pageSize?: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface WhatsAppMessageOptions {
  productName: string;
  price?: number | string | null;
  priceType?: PriceType | string;
  productUrl: string;
  dates?: { startDate: string | Date; endDate: string | Date } | null;
  note?: string;
  template?: string;
}

export interface SettingsShape {
  siteName: string;
  whatsappNumber: string;
  whatsappTemplate: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  footerText: string;
  heroTitle: string;
  heroSlogan: string;
  heroImage: string;
  ctaText: string;
  seoTitle: string;
  seoDescription: string;
  mapsUrl: string;
  announcementBar: string;
  maintenanceMode: boolean;
  logo: string;
  favicon: string;
}

export interface UploadResult {
  url: string;
  provider: "local" | "cloudinary";
  width?: number;
  height?: number;
  bytes?: number;
}

export interface ActivityLogInput {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: Record<string, unknown> | null;
}
