import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import { parseGalleryJson } from "@/lib/product-image-bulk";

async function requireBusiness() {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return { err: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  if (session.user.role !== "BUSINESS")
    return { err: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  const businessId = session.user.businessId;
  if (!businessId)
    return { err: NextResponse.json({ message: "Business not found" }, { status: 404 }) };
  return { businessId };
}

export async function GET() {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const products = await prisma.product.findMany({
    where: { businessId: auth.businessId },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      productCode: true,
      barcode: true,
      brand: true,
      imageUrl: true,
      imageGallery: true,
      productcategory: { select: { name: true } },
    },
  });

  const headers = [
    "ID",
    "Ürün/Hizmet Adı",
    "Ürün Kodu",
    "Barkodu",
    "Marka",
    "Kategori",
    "Resim 1",
    "Resim 2",
    "Resim 3",
    "Resim 4",
    "Resim 5",
    "Resim 6",
  ];

  const rows = [headers];
  for (const p of products) {
    const gal = parseGalleryJson(p.imageGallery);
    const imgs = [p.imageUrl, ...gal].map((x) => (x ? String(x) : ""));
    while (imgs.length < 6) imgs.push("");
    rows.push([
      p.id,
      p.name,
      p.productCode ?? "",
      p.barcode ?? "",
      p.brand ?? "",
      p.productcategory?.name ?? "",
      ...imgs.slice(0, 6),
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ürünler");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="urun-resim-listesi-${stamp}.xlsx"`,
    },
  });
}
