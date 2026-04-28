import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function toStr(v) {
  return (v ?? "").toString().trim();
}

async function requireBusiness() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { err: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  if (!["BUSINESS", "ADMIN"].includes(session.user.role)) return { err: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  const businessId = session.user.businessId;
  if (!businessId) return { err: NextResponse.json({ message: "Business not found" }, { status: 404 }) };
  return { businessId };
}

function mapRun(r) {
  return {
    id: r.id,
    productId: r.productId,
    productName: r.product.name,
    outputWarehouseId: r.outputWarehouseId ?? null,
    outputWarehouseName: r.outputWarehouse?.name ?? null,
    quantity: r.quantity,
    unit: r.unit,
    recipe: r.recipe,
    description: r.description ?? null,
    startDate: r.startDate,
    endDate: r.endDate,
    status: r.status,
    cost: r.cost,
    lineCount: r._count?.lines ?? 0,
    createdAt: r.createdAt,
  };
}

/** GET - list production runs */
export async function GET() {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const runs = await prisma.production_run.findMany({
    where: { businessId: auth.businessId },
    include: {
      product: { select: { id: true, name: true } },
      outputWarehouse: { select: { id: true, name: true } },
      _count: { select: { lines: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(runs.map(mapRun));
}

function roundQty(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.round(x);
}

/** POST - create production run (+ optional consumption lines, stock) */
export async function POST(req) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const body = await req.json();
  const productId = toStr(body?.productId);
  const quantity = Math.max(0, Number(body?.quantity) || 0);
  const unit = toStr(body?.unit) || "adet";
  const recipe = toStr(body?.recipe) || null;
  const description = toStr(body?.description) || null;
  const outputWarehouseId = toStr(body?.outputWarehouseId) || null;
  const startDate = body?.startDate ? new Date(body.startDate) : new Date();
  const endDate = body?.endDate ? new Date(body.endDate) : startDate;
  const legacyCost = Math.max(0, Number(body?.cost) || 0);

  const linesInput = Array.isArray(body?.lines) ? body.lines : [];
  const hasLines = linesInput.length > 0;

  if (!productId) return NextResponse.json({ message: "Ürün seçin." }, { status: 400 });

  const outputProduct = await prisma.product.findFirst({
    where: { id: productId, businessId: auth.businessId },
    select: { id: true, name: true },
  });
  if (!outputProduct) return NextResponse.json({ message: "Ürün bulunamadı." }, { status: 404 });

  if (hasLines) {
    if (!outputWarehouseId) {
      return NextResponse.json({ message: "Çıktı deposu seçin." }, { status: 400 });
    }
    const whOut = await prisma.warehouse.findFirst({
      where: { id: outputWarehouseId, businessId: auth.businessId },
      select: { id: true },
    });
    if (!whOut) return NextResponse.json({ message: "Depo bulunamadı." }, { status: 404 });
  }

  const normalizedLines = [];
  let computedCost = 0;

  if (hasLines) {
    for (const row of linesInput) {
      const pid = toStr(row?.productId);
      const wid = toStr(row?.warehouseId);
      const qty = Math.max(0, Number(row?.quantity) || 0);
      const unitCost = Math.max(0, Number(row?.unitCost) || 0);
      const lineDesc = toStr(row?.description) || null;
      const pvid = row?.productVariantId ? toStr(row.productVariantId) : null;

      if (!pid || !wid) {
        return NextResponse.json({ message: "Her satırda ürün ve depo zorunludur." }, { status: 400 });
      }

      const comp = await prisma.product.findFirst({
        where: { id: pid, businessId: auth.businessId },
        select: { id: true },
      });
      if (!comp) return NextResponse.json({ message: "Malzeme ürünü bulunamadı." }, { status: 404 });

      const wh = await prisma.warehouse.findFirst({
        where: { id: wid, businessId: auth.businessId },
        select: { id: true },
      });
      if (!wh) return NextResponse.json({ message: "Malzeme deposu bulunamadı." }, { status: 404 });

      if (pvid) {
        const v = await prisma.productvariant.findFirst({
          where: { id: pvid, productId: pid },
          select: { id: true },
        });
        if (!v) return NextResponse.json({ message: "Varyant bulunamadı." }, { status: 404 });
      }

      const lineCost = qty * unitCost;
      computedCost += lineCost;
      normalizedLines.push({
        productId: pid,
        warehouseId: wid,
        productVariantId: pvid,
        quantity: qty,
        unitCost,
        lineCost,
        description: lineDesc,
      });
    }
  }

  const finalCost = hasLines ? computedCost : legacyCost;
  const status = hasLines ? "COMPLETED" : "IN_PROGRESS";

  const run = await prisma.$transaction(async (tx) => {
    const created = await tx.production_run.create({
      data: {
        businessId: auth.businessId,
        productId,
        outputWarehouseId: hasLines ? outputWarehouseId : outputWarehouseId || null,
        quantity,
        unit,
        recipe,
        description,
        startDate,
        endDate,
        cost: finalCost,
        status,
        ...(hasLines
          ? {
              lines: {
                create: normalizedLines.map((l) => ({
                  productId: l.productId,
                  warehouseId: l.warehouseId,
                  productVariantId: l.productVariantId,
                  quantity: l.quantity,
                  unitCost: l.unitCost,
                  lineCost: l.lineCost,
                  description: l.description,
                })),
              },
            }
          : {}),
      },
      include: {
        product: { select: { name: true } },
        outputWarehouse: { select: { name: true } },
        _count: { select: { lines: true } },
      },
    });

    if (hasLines && outputWarehouseId) {
      const outDelta = roundQty(quantity);
      await adjustWarehouseStock(tx, auth.businessId, outputWarehouseId, productId, outDelta);

      for (const l of normalizedLines) {
        const use = roundQty(l.quantity);
        await adjustWarehouseStock(tx, auth.businessId, l.warehouseId, l.productId, -use);
      }
    }

    return created;
  });

  return NextResponse.json(mapRun(run), { status: 201 });
}

async function adjustWarehouseStock(tx, businessId, warehouseId, productId, delta) {
  if (delta === 0) return;
  const key = { warehouseId_productId: { warehouseId, productId } };
  const row = await tx.warehouse_product_stock.findUnique({ where: key });
  if (!row) {
    await tx.warehouse_product_stock.create({
      data: {
        businessId,
        warehouseId,
        productId,
        quantity: delta,
      },
    });
  } else {
    await tx.warehouse_product_stock.update({
      where: { id: row.id },
      data: { quantity: row.quantity + delta },
    });
  }
}
