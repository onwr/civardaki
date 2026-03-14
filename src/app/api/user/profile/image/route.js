import { mkdir, unlink } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const userId = session.user.id;
    const userDir = join(process.cwd(), "public", "uploads", "users", userId);
    await mkdir(userDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `avatar_${Date.now()}.webp`;
    const filePath = join(userDir, fileName);

    const sharp = (await import("sharp")).default;
    await sharp(buffer, { limitInputPixels: 268402689 })
      .resize(600, 600, { fit: "cover" })
      .webp({ quality: 82 })
      .toFile(filePath);

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });
    if (dbUser?.image?.startsWith("/uploads/users/")) {
      const oldPath = join(process.cwd(), "public", dbUser.image.replace(/^\/+/, ""));
      await unlink(oldPath).catch(() => {});
    }

    const url = `/uploads/users/${userId}/${fileName}`;
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
