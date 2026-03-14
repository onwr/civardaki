import { mkdir, unlink } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";

export async function processAndSaveMedia(file, type, businessId, businessSlug) {
    if (!file || typeof file !== "object" || typeof file.arrayBuffer !== "function") {
        throw new Error("Geçersiz dosya.");
    }

    const allowedMime = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!allowedMime.has(file.type)) {
        throw new Error("Sadece resim dosyaları (jpeg, png, webp) yüklenebilir.");
    }

    const allowedTypes = new Set(["LOGO", "COVER", "GALLERY", "PRODUCT"]);
    if (!allowedTypes.has(type)) {
        throw new Error("Geçersiz yükleme türü.");
    }

    const maxBytes = 5 * 1024 * 1024; // 5MB limit
    if (typeof file.size === "number" && file.size > maxBytes) {
        throw new Error("Dosya boyutu 5MB'dan büyük olamaz.");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), "public", "uploads", "businesses", businessSlug);
    await mkdir(uploadDir, { recursive: true });

    const fileName = `${type.toLowerCase()}_${Date.now()}.webp`;
    const filePath = join(uploadDir, fileName);

    const sharp = (await import("sharp")).default;
    let sharpInstance = sharp(buffer, { limitInputPixels: 268402689 });

    if (type === "LOGO") {
        sharpInstance = sharpInstance.resize(400, 400, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } });
    } else if (type === "COVER") {
        sharpInstance = sharpInstance.resize(1920, 1080, { fit: "cover", withoutEnlargement: true });
    } else if (type === "PRODUCT") {
        sharpInstance = sharpInstance.resize(1280, 1280, { fit: "inside", withoutEnlargement: true });
    } else {
        sharpInstance = sharpInstance.resize(1280, 1280, { fit: "inside", withoutEnlargement: true });
    }

    await sharpInstance.webp({ quality: 80 }).toFile(filePath);

    const fileUrl = `/uploads/businesses/${businessSlug}/${fileName}`;

    if (type === "LOGO" || type === "COVER") {
        const oldMediaList = await prisma.media.findMany({
            where: { businessId: businessId, type: type }
        });

        for (const oldMedia of oldMediaList) {
            try {
                const oldPath = join(uploadDir, oldMedia.fileId);
                await unlink(oldPath);
            } catch (e) {
                // Ignore missing file errors
            }
            await prisma.media.delete({ where: { id: oldMedia.id } });
        }
    }

    const media = await prisma.media.create({
        data: {
            url: fileUrl,
            fileId: fileName,
            type: type,
            businessId: businessId,
        }
    });

    return { url: fileUrl, media };
}
