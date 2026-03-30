import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function toStr(v) {
  return (v ?? "").toString().trim();
}

function productCode(row) {
  const digits = String(row?.slug || "").replace(/\D/g, "");
  if (digits.length >= 4) return `DKV${digits.slice(-4)}`;
  const alnum = String(row?.id || "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
  return `DKV${alnum.slice(-4).padStart(4, "0")}`;
}

async function requireBusiness() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { err: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }
  if (session.user.role !== "BUSINESS") {
    return { err: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }
  const businessId = session.user.businessId;
  if (!businessId) {
    return { err: NextResponse.json({ message: "Business not found" }, { status: 404 }) };
  }
  return { businessId };
}

/** GET - depodaki ürün satırları + toplam değer */
export async function GET(req, { params }) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const resolved = await params;
  const warehouseId = resolved?.id;
  if (!warehouseId) {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }

  const wh = await prisma.warehouse.findFirst({
    where: { id: warehouseId, businessId: auth.businessId },
    select: { id: true, name: true },
  });
  if (!wh) {
    return NextResponse.json({ message: "Depo bulunamadı." }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const q = toStr(searchParams.get("q"));

  let stocks = await prisma.warehouse_product_stock.findMany({
    where: { warehouseId },
  });

  if (stocks.length === 0) {
    const prods = await prisma.product.findMany({
      where: { businessId: auth.businessId },
      select: { id: true, stock: true },
    });
    if (prods.length > 0) {
      await prisma.warehouse_product_stock.createMany({
        data: prods.map((p) => ({
          businessId: auth.businessId,
          warehouseId,
          productId: p.id,
          quantity: p.stock ?? 0,
        })),
        skipDuplicates: true,
      });
      stocks = await prisma.warehouse_product_stock.findMany({
        where: { warehouseId },
      });
    }
  }

  const qtyByProduct = new Map(stocks.map((s) => [s.productId, s.quantity]));

  const products = await prisma.product.findMany({
    where: {
      businessId: auth.businessId,
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { slug: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      discountPrice: true,
    },
  });

  let totalValue = 0;
  const items = products.map((p) => {
    const qty = qtyByProduct.get(p.id) ?? 0;
    const unit =
      p.discountPrice != null && Number.isFinite(Number(p.discountPrice))
        ? Number(p.discountPrice)
        : p.price != null && Number.isFinite(Number(p.price))
          ? Number(p.price)
          : 0;
    const lineValue = qty * unit;
    totalValue += lineValue;
    return {
      productId: p.id,
      code: productCode(p),
      barcode: null,
      name: p.name,
      quantity: qty,
      lineValue,
    };
  });

  const hasNegative = items.some((i) => i.quantity < 0);

  return NextResponse.json({
    warehouse: wh,
    items,
    totalValue,
    hasNegative,
  });
}
