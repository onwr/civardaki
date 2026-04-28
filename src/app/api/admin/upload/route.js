import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToCDN } from "@/lib/cdnUpload";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

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
      return NextResponse.json({ success: false, error: "Dosya 5MB'dan büyük olamaz." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `cat_${Date.now()}.webp`;

    const sharp = (await import("sharp")).default;
    const processedBuffer = await sharp(buffer, { limitInputPixels: 268402689 })
      .resize(800, 800, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const processedFile = new File([processedBuffer], fileName, { type: "image/webp" });
    const url = await uploadToCDN(processedFile);
    return NextResponse.json({ success: true, url });
  } catch (e) {
    console.error("Admin upload error:", e);
    return NextResponse.json({ success: false, error: "Yükleme başarısız." }, { status: 500 });
  }
}
