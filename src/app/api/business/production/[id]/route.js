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
  if (session.user.role !== "BUSINESS") return { err: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  const businessId = session.user.businessId;
  if (!businessId) return { err: NextResponse.json({ message: "Business not found" }, { status: 404 }) };
  return { businessId };
}

function serializeRun(run) {
  return {
    id: run.id,
    productId: run.productId,
    productName: run.product.name,
    outputWarehouseId: run.outputWarehouseId ?? null,
    outputWarehouseName: run.outputWarehouse?.name ?? null,
    quantity: run.quantity,
    unit: run.unit,
    recipe: run.recipe,
    description: run.description ?? null,
    startDate: run.startDate,
    endDate: run.endDate,
    status: run.status,
    cost: run.cost,
    lineCount: run._count?.lines ?? 0,
    createdAt: run.createdAt,
    lines: run.lines
      ? run.lines.map((l) => ({
          id: l.id,
          productId: l.productId,
          productName: l.product.name,
          warehouseId: l.warehouseId,
          warehouseName: l.warehouse.name,
          productVariantId: l.productVariantId,
          variantName: l.productVariant?.name ?? null,
          quantity: l.quantity,
          unitCost: l.unitCost,
          lineCost: l.lineCost,
          description: l.description,
        }))
      : undefined,
  };
}

async function getRunDetail(id, businessId) {
  return prisma.production_run.findFirst({
    where: { id, businessId },
    include: {
      product: { select: { id: true, name: true } },
      outputWarehouse: { select: { id: true, name: true } },
      _count: { select: { lines: true } },
      lines: {
        orderBy: { createdAt: "asc" },
        include: {
          product: { select: { id: true, name: true } },
          warehouse: { select: { id: true, name: true } },
          productVariant: { select: { id: true, name: true } },
        },
      },
    },
  });
}

/** GET - production run detail with lines */
export async function GET(req, { params }) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const resolved = await params;
  const id = resolved?.id;
  if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  const run = await getRunDetail(id, auth.businessId);
  if (!run) return NextResponse.json({ message: "Üretim kaydı bulunamadı." }, { status: 404 });

  return NextResponse.json(serializeRun(run));
}

/** PATCH - update production run (e.g. status) */
export async function PATCH(req, { params }) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const resolved = await params;
  const id = resolved?.id;
  if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  const existing = await getRunDetail(id, auth.businessId);
  if (!existing) return NextResponse.json({ message: "Üretim kaydı bulunamadı." }, { status: 404 });

  const body = await req.json();
  const status =
    body?.status !== undefined
      ? body.status === "COMPLETED" || body.status === "IN_PROGRESS"
        ? body.status
        : existing.status
      : undefined;

  const updated = await prisma.production_run.update({
    where: { id },
    data: { ...(status !== undefined ? { status } : {}) },
    include: {
      product: { select: { name: true } },
      outputWarehouse: { select: { name: true } },
      _count: { select: { lines: true } },
    },
  });

  return NextResponse.json(serializeRun(updated));
}

/** DELETE */
export async function DELETE(req, { params }) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const resolved = await params;
  const id = resolved?.id;
  if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  const existing = await prisma.production_run.findFirst({
    where: { id, businessId: auth.businessId },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ message: "Üretim kaydı bulunamadı." }, { status: 404 });

  await prisma.production_run.delete({ where: { id } });
  return NextResponse.json({ message: "Silindi" });
}
