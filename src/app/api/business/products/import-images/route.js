import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import { unlink } from "fs/promises";
import { join } from "path";
import { validateHttpsImageUrl } from "@/lib/product-image-bulk";

async function requireBusiness() {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return { err: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  if (!["BUSINESS", "ADMIN"].includes(session.user.role))
    return { err: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  const businessId = session.user.businessId;
  if (!businessId)
    return { err: NextResponse.json({ message: "Business not found" }, { status: 404 }) };
  return { businessId };
}

async function deleteLocalUploadIfAny(imageUrl) {
  if (!imageUrl?.startsWith("/uploads/")) return;
  try {
    const relativePath = imageUrl.replace(/^\//, "");
    const absolutePath = join(process.cwd(), "public", relativePath);
    await unlink(absolutePath);
  } catch (e) {
    console.error("import-images: local file delete failed", e);
  }
}

export async function POST(req) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  let form;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ message: "Geçersiz istek." }, { status: 400 });
  }

  const file = form.get("file");
  if (!file || typeof file === "string" || !file.size) {
    return NextResponse.json({ message: "Excel dosyası gerekli." }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  let workbook;
  try {
    workbook = XLSX.read(buf, { type: "buffer" });
  } catch {
    return NextResponse.json({ message: "Excel okunamadı." }, { status: 400 });
  }

  const sheetName = workbook.SheetNames[0];
  const ws = workbook.Sheets[sheetName];
  if (!ws) {
    return NextResponse.json({ message: "Sayfa bulunamadı." }, { status: 400 });
  }

  const matrix = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  if (!matrix.length || matrix.length < 2) {
    return NextResponse.json({ message: "Dosyada veri yok." }, { status: 400 });
  }

  const header = matrix[0].map((h) => String(h ?? "").trim());
  const idx = (label, alt) => {
    const i = header.findIndex(
      (h) =>
        h.toLowerCase() === label.toLowerCase() ||
        (alt && h.toLowerCase() === alt.toLowerCase()),
    );
    return i;
  };

  const idCol = idx("ID");
  if (idCol < 0) {
    return NextResponse.json(
      { message: "ID sütunu bulunamadı. Sütun sırasını değiştirmeyin." },
      { status: 400 },
    );
  }

  let resimStart = header.findIndex((h) =>
    /^resim\s*1$/i.test(String(h).trim()),
  );
  if (resimStart < 0 && header.length >= 12) {
    resimStart = 6;
  }
  if (resimStart < 0) {
    return NextResponse.json(
      { message: "Resim 1 sütunu bulunamadı. İlk satırı değiştirmeyin." },
      { status: 400 },
    );
  }

  const errors = [];
  let updated = 0;

  for (let r = 1; r < matrix.length; r++) {
    const row = matrix[r];
    const excelRow = r + 1;
    const id = String(row[idCol] ?? "").trim();
    if (!id) continue;

    const cells = [];
    for (let c = 0; c < 6; c++) {
      cells.push(String(row[resimStart + c] ?? "").trim());
    }

    const urls = [];
    let rowInvalid = false;
    for (const c of cells) {
      if (!c) continue;
      const v = validateHttpsImageUrl(c);
      if (v === false) {
        errors.push({
          row: excelRow,
          message: `Geçersiz resim URL (yalnızca https ve .jpg/.jpeg/.gif/.png): ${c.slice(0, 80)}`,
        });
        rowInvalid = true;
        break;
      }
      if (v) urls.push(v);
    }

    if (rowInvalid) continue;

    const imageUrl = urls[0] ?? null;
    const gallery = urls.slice(1, 6);

    const existing = await prisma.product.findFirst({
      where: { id, businessId: auth.businessId },
      select: { id: true, imageUrl: true },
    });

    if (!existing) {
      errors.push({ row: excelRow, message: "Bu ID bu işletmeye ait değil veya yok." });
      continue;
    }

    if (imageUrl !== existing.imageUrl && existing.imageUrl?.startsWith("/uploads/")) {
      await deleteLocalUploadIfAny(existing.imageUrl);
    }

    await prisma.product.update({
      where: { id },
      data: {
        imageUrl,
        imageGallery: gallery.length ? gallery : null,
      },
    });
    updated++;
  }

  return NextResponse.json({
    updated,
    errors,
    message:
      errors.length === 0
        ? `${updated} ürün güncellendi.`
        : `${updated} ürün güncellendi, ${errors.length} satırda uyarı/hata.`,
  });
}
