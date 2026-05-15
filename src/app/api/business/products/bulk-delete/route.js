import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBusinessSession } from "@/lib/require-business-api";
import { unlink } from "fs/promises";
import { join } from "path";

const MAX_IDS = 500;

export async function POST(req) {
  const auth = await requireBusinessSession();
  if (auth.err) return auth.err;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Geçersiz istek." }, { status: 400 });
  }

  const raw = Array.isArray(body?.ids) ? body.ids : [];
  const ids = [...new Set(raw.map((x) => String(x ?? "").trim()).filter(Boolean))].slice(
    0,
    MAX_IDS,
  );

  if (ids.length === 0) {
    return NextResponse.json({ message: "Silinecek ürün seçilmedi." }, { status: 400 });
  }

  try {
    const rows = await prisma.product.findMany({
      where: { businessId: auth.businessId, id: { in: ids } },
      select: { id: true, imageUrl: true },
    });

    if (rows.length === 0) {
      return NextResponse.json({ message: "Eşleşen ürün bulunamadı." }, { status: 404 });
    }

    for (const r of rows) {
      if (r.imageUrl?.startsWith("/uploads/")) {
        try {
          const relativePath = r.imageUrl.replace(/^\//, "");
          const absolutePath = join(process.cwd(), "public", relativePath);
          await unlink(absolutePath);
        } catch (e) {
          console.error("bulk-delete: local image unlink", e);
        }
      }
    }

    const result = await prisma.product.deleteMany({
      where: { businessId: auth.businessId, id: { in: rows.map((r) => r.id) } },
    });

    return NextResponse.json({
      deleted: result.count,
      message: `${result.count} ürün silindi.`,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Toplu silme başarısız." }, { status: 500 });
  }
}
