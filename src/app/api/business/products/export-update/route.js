import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import { formatTrMoney } from "@/lib/tr-money";
import { SALES_UNIT_LABELS } from "@/lib/product-sales-units";

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

function moneyCell(n) {
  if (n == null || !Number.isFinite(Number(n))) return "";
  return formatTrMoney(Number(n));
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
      price: true,
      discountPrice: true,
      priceCurrency: true,
      salesUnit: true,
      stock: true,
      isActive: true,
      tagsString: true,
    },
  });

  const headers = [
    "ID",
    "Ürün/Hizmet Adı",
    "Liste Satış Fiyatı",
    "İndirimli Fiyat",
    "Para Birimi",
    "Satış Birimi",
    "Stok",
    "Aktif/Pasif",
    "Etiketler",
  ];

  const rows = [headers];
  for (const p of products) {
    const cur = p.priceCurrency || "TL";
    const su = p.salesUnit || "ADET";
    const suLabel = SALES_UNIT_LABELS[su] || su;
    rows.push([
      p.id,
      p.name,
      moneyCell(p.price),
      moneyCell(p.discountPrice),
      cur === "TRY" ? "TL" : cur,
      suLabel,
      p.stock != null ? String(p.stock) : "",
      p.isActive ? "A" : "P",
      p.tagsString ?? "",
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
      "Content-Disposition": `attachment; filename="urun-toplu-guncelleme-${stamp}.xlsx"`,
    },
  });
}
