import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/activity-log";
import { UploadValidationError, uploadImage } from "@/lib/upload";
import type { ApiResponse, UploadResult } from "@/types";

export async function POST(request: Request): Promise<NextResponse<ApiResponse<UploadResult>>> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ success: false, error: "İcazə yoxdur" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Fayl tapılmadı" },
        { status: 400 },
      );
    }

    const result = await uploadImage(file);

    await logActivity({
      userId: session.user.id,
      action: "UPLOAD",
      entity: "Media",
      details: { url: result.url, provider: result.provider },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    console.error("[api/upload] Upload failed:", error);
    return NextResponse.json(
      { success: false, error: "Fayl yüklənərkən xəta baş verdi" },
      { status: 500 },
    );
  }
}
