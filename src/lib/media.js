import { prisma } from "@/lib/prisma";
import { uploadToCDN } from "@/lib/cdnUpload";

export async function processAndSaveMedia(file, type, businessId, businessSlug) {
    if (!file || typeof file !== "object" || typeof file.arrayBuffer !== "function") {
        throw new Error("Geçersiz dosya.");
    }

    const imageMime = new Set(["image/jpeg", "image/png", "image/webp"]);
    const documentMime = new Set([
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]);

    const allowedTypes = new Set(["LOGO", "COVER", "GALLERY", "PRODUCT", "DOCUMENT"]);
    if (!allowedTypes.has(type)) {
        throw new Error("Geçersiz yükleme türü.");
    }

    const isImageUpload = type !== "DOCUMENT";
    const allowedMime = isImageUpload ? imageMime : documentMime;
    if (!allowedMime.has(file.type)) {
        if (isImageUpload) {
            throw new Error("Sadece resim dosyaları (jpeg, png, webp) yüklenebilir.");
        }
        throw new Error("Sadece resim, pdf, word veya excel dosyaları yüklenebilir.");
    }

    const maxBytes = 5 * 1024 * 1024; // 5MB limit
    if (typeof file.size === "number" && file.size > maxBytes) {
        throw new Error("Dosya boyutu 5MB'dan büyük olamaz.");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalExt = (() => {
        const rawName = typeof file.name === "string" ? file.name : "";
        const idx = rawName.lastIndexOf(".");
        if (idx === -1) return "";
        return rawName.slice(idx + 1).toLowerCase().replace(/[^a-z0-9]/g, "");
    })();

    const extByMime = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "application/pdf": "pdf",
        "application/msword": "doc",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
        "application/vnd.ms-excel": "xls",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    };
    
    // For images compressed to webp we force the extension later
    let finalExt = extByMime[file.type] || originalExt || "bin";
    if (isImageUpload) finalExt = "webp";
    
    const fileName = `${type.toLowerCase()}_${Date.now()}.${finalExt}`;
    let fileUrl = "";

    if (isImageUpload) {
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

        const processedBuffer = await sharpInstance.webp({ quality: 80 }).toBuffer();
        const processedFile = new File([processedBuffer], fileName, { type: "image/webp" });
        fileUrl = await uploadToCDN(processedFile);
    } else {
        const processedFile = new File([buffer], fileName, { type: file.type });
        fileUrl = await uploadToCDN(processedFile);
    }

    if (type === "LOGO" || type === "COVER") {
        const oldMediaList = await prisma.media.findMany({
            where: { businessId: businessId, type: type }
        });

        for (const oldMedia of oldMediaList) {
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
