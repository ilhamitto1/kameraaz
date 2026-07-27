import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { getAdminClient } from "@/lib/supabase/admin";
import type { UploadResult } from "@/types";

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const BUCKET = "product-images";

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export class UploadValidationError extends Error {}

function validateFile(file: File): void {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new UploadValidationError(
      "Yalnız şəkil faylları qəbul edilir (JPEG, PNG, WEBP, GIF, AVIF)",
    );
  }
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new UploadValidationError("Faylın həcmi 5MB-dan çox ola bilməz");
  }
  if (file.size === 0) {
    throw new UploadValidationError("Fayl boşdur");
  }
}

function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Şəkil yükləmə — Cloudinary lazım deyil.
 * 1) Supabase Storage (lokal + production)
 * 2) Fallback: lokal disk (yalnız dev, Supabase yoxdursa)
 */
export async function uploadImage(file: File): Promise<UploadResult> {
  validateFile(file);

  if (isSupabaseConfigured()) {
    return uploadToSupabase(file);
  }

  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    throw new UploadValidationError(
      "Şəkil yükləmək üçün NEXT_PUBLIC_SUPABASE_URL və SUPABASE_SERVICE_ROLE_KEY təyin edin.",
    );
  }

  return uploadToLocalDisk(file);
}

async function ensureProductImagesBucket() {
  const sb = getAdminClient();
  const { data: buckets, error: listError } = await sb.storage.listBuckets();
  if (listError) {
    throw new UploadValidationError(`Storage oxuna bilmədi: ${listError.message}`);
  }

  if (!buckets?.some((b) => b.name === BUCKET || b.id === BUCKET)) {
    const { error: createError } = await sb.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_UPLOAD_SIZE_BYTES,
      allowedMimeTypes: Array.from(ALLOWED_IMAGE_TYPES),
    });
    if (createError && !/already exists|duplicate/i.test(createError.message)) {
      throw new UploadValidationError(`Storage bucket yaradılmadı: ${createError.message}`);
    }
  }
}

async function uploadToSupabase(file: File): Promise<UploadResult> {
  await ensureProductImagesBucket();

  const sb = getAdminClient();
  const extension = EXTENSION_BY_MIME[file.type] ?? "bin";
  const filename = `${Date.now()}-${randomUUID()}.${extension}`;
  const objectPath = `products/${filename}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await sb.storage.from(BUCKET).upload(objectPath, buffer, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) {
    throw new UploadValidationError(error.message || "Şəkil Storage-a yüklənmədi");
  }

  const { data } = sb.storage.from(BUCKET).getPublicUrl(objectPath);
  if (!data?.publicUrl) {
    throw new UploadValidationError("Şəkil URL-i alınmadı");
  }

  return {
    url: data.publicUrl,
    provider: "supabase",
    bytes: buffer.byteLength,
  };
}

async function uploadToLocalDisk(file: File): Promise<UploadResult> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = EXTENSION_BY_MIME[file.type] ?? "bin";
  const filename = `${Date.now()}-${randomUUID()}.${extension}`;

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const filePath = path.join(uploadsDir, filename);
  await writeFile(filePath, buffer);

  return {
    url: `/uploads/${filename}`,
    provider: "local",
    bytes: buffer.byteLength,
  };
}
