import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { mkdir } from "fs/promises";
import { join } from "path";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 8 * 1024 * 1024; // 8MB

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Yetkisiz." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || typeof file !== "object" || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ success: false, error: "Dosya gerekli." }, { status: 400 });
    }

    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json({ success: false, error: "Sadece resim (JPEG, PNG, WebP) yüklenebilir." }, { status: 400 });
    }
    if (typeof file.size === "number" && file.size > MAX_BYTES) {
      return NextResponse.json({ success: false, error: "Dosya 8MB'dan büyük olamaz." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = join(process.cwd(), "public", "uploads", "hero");
    await mkdir(uploadDir, { recursive: true });

    const fileName = `hero_${Date.now()}.webp`;
    const filePath = join(uploadDir, fileName);

    const sharp = (await import("sharp")).default;
    await sharp(buffer, { limitInputPixels: 268402689 })
      .resize(1920, 900, { fit: "cover", withoutEnlargement: false })
      .webp({ quality: 85 })
      .toFile(filePath);

    const url = `/uploads/hero/${fileName}`;
    return NextResponse.json({ success: true, url });
  } catch (e) {
    console.error("Hero upload error:", e);
    return NextResponse.json({ success: false, error: "Yükleme başarısız." }, { status: 500 });
  }
}
