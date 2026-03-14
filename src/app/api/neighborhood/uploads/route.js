import { mkdir } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files");
    if (!files.length) {
      return NextResponse.json({ error: "En az bir görsel seçmelisiniz." }, { status: 400 });
    }

    const userId = session.user.id;
    const uploadDir = join(process.cwd(), "public", "uploads", "neighborhood", userId);
    await mkdir(uploadDir, { recursive: true });

    const sharp = (await import("sharp")).default;
    const uploadedUrls = [];

    for (const file of files) {
      if (!file || typeof file !== "object" || typeof file.arrayBuffer !== "function") {
        continue;
      }
      if (!ALLOWED_MIME.has(file.type)) {
        return NextResponse.json({ error: "Sadece JPEG, PNG veya WEBP dosyaları desteklenir." }, { status: 400 });
      }
      if (typeof file.size === "number" && file.size > MAX_BYTES) {
        return NextResponse.json({ error: "Her görsel en fazla 8MB olabilir." }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `post_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.webp`;
      const filePath = join(uploadDir, fileName);

      await sharp(buffer, { limitInputPixels: 268402689 })
        .rotate()
        .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 84 })
        .toFile(filePath);

      uploadedUrls.push(`/uploads/neighborhood/${userId}/${fileName}`);
    }

    return NextResponse.json({ success: true, urls: uploadedUrls });
  } catch (error) {
    console.error("POST /api/neighborhood/uploads error:", error);
    return NextResponse.json({ error: "Görsel yüklenemedi." }, { status: 500 });
  }
}
