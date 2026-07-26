import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import type { UploadResult } from "@/types";

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export class UploadValidationError extends Error {}

function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

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

/**
 * Uploads an image file, using Cloudinary if configured via `CLOUDINARY_*` env
 * vars, otherwise falling back to local disk storage under `public/uploads`.
 */
export async function uploadImage(file: File): Promise<UploadResult> {
  validateFile(file);

  if (isCloudinaryConfigured()) {
    return uploadToCloudinary(file);
  }

  return uploadToLocalDisk(file);
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

async function uploadToCloudinary(file: File): Promise<UploadResult> {
  const { v2: cloudinary } = await import("cloudinary");

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(base64, {
    folder: "kameraz",
    resource_type: "image",
  });

  return {
    url: result.secure_url,
    provider: "cloudinary",
    width: result.width,
    height: result.height,
    bytes: result.bytes,
  };
}
