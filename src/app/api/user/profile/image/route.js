import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToCDN } from "@/lib/cdnUpload";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || typeof file !== "object" || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ error: "Dosya gerekli." }, { status: 400 });
    }
    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json(
        { error: "Sadece JPEG, PNG veya WEBP desteklenir." },
        { status: 400 },
      );
    }
    if (typeof file.size === "number" && file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Dosya boyutu 5MB'dan büyük olamaz." },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `avatar_${Date.now()}.webp`;
    const userId = session.user.id;

    const sharp = (await import("sharp")).default;
    const processedBuffer = await sharp(buffer, { limitInputPixels: 268402689 })
      .resize(600, 600, { fit: "cover" })
      .webp({ quality: 82 })
      .toBuffer();

    const processedFile = new File([processedBuffer], fileName, { type: "image/webp" });
    const url = await uploadToCDN(processedFile);
    await prisma.user.update({
      where: { id: userId },
      data: { image: url },
    });

    return NextResponse.json({ success: true, image: url });
  } catch (err) {
    console.error("POST /api/user/profile/image error:", err);
    return NextResponse.json(
      { error: "Profil resmi yüklenemedi." },
      { status: 500 },
    );
  }
}
