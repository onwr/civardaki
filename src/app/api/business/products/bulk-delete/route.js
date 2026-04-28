import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";

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

const MAX_IDS = 500;

export async function POST(req) {
  const auth = await requireBusiness();
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
