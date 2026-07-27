import type { AvailabilityStatus, MessageStatus, PriceType } from "@/types/database";

export type { AvailabilityStatus, MessageStatus, PriceType };

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  icon?: string | null;
  sortOrder: number;
  isVisible: boolean;
  showInNav: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  shortDesc?: string | null;
  longDesc?: string | null;
  dailyPrice?: number | null;
  weeklyPrice?: number | null;
  monthlyPrice?: number | null;
  deposit?: number | null;
  showDailyPrice: boolean;
  showWeeklyPrice: boolean;
  showMonthlyPrice: boolean;
  mainImage?: string | null;
  status: AvailabilityStatus;
  badge?: string | null;
  sortOrder: number;
  isFeatured: boolean;
  isActive: boolean;
  isNew: boolean;
  includedItems: string[];
  usageRules?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  viewCount: number;
  whatsappClicks: number;
  categoryId: string;
  brandId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  archivedAt?: string | null;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
  sortOrder: number;
  productId: string;
  createdAt: string;
}

export interface Specification {
  id: string;
  label: string;
  value: string;
  sortOrder: number;
  productId: string;
}

export type ProductWithRelations = Product & {
  category: Category;
  brand: Brand;
  images: ProductImage[];
  specifications: Specification[];
};

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
  provider: "local" | "supabase" | "cloudinary";
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
