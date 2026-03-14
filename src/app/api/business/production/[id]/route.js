import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function toStr(v) { return (v ?? "").toString().trim(); }

async function requireBusiness() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { err: NextResponse.json({ message: "Unauthorized" }, { status: 401 })};
  if (session.user.role !== "BUSINESS") return { err: NextResponse.json({ message: "Forbidden" }, { status: 403 })};
  const businessId = session.user.businessId;
  if (!businessId) return { err: NextResponse.json({ message: "Business not found" }, { status: 404 })};
  return { businessId };
}

async function getRunAndCheck(id, businessId) {
  return prisma.production_run.findFirst({
    where: { id, businessId },
    include: { product: { select: { name: true } } },
  });
}

/** PATCH - update production run (e.g. status) */
export async function PATCH(req, { params }) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const resolved = await params;
  const id = resolved?.id;
  if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  const existing = await getRunAndCheck(id, auth.businessId);
  if (!existing) return NextResponse.json({ message: "Üretim kaydı bulunamadı." }, { status: 404 });

  const body = await req.json();
  const status = body?.status !== undefined ? (body.status === "COMPLETED" || body.status === "IN_PROGRESS" ? body.status : existing.status) : undefined;

  const updated = await prisma.production_run.update({
    where: { id },
    data: { ...(status !== undefined ? { status } : {}) },
    include: { product: { select: { name: true } } },
  });

  return NextResponse.json({
    id: updated.id,
    productId: updated.productId,
    productName: updated.product.name,
    quantity: updated.quantity,
    unit: updated.unit,
    recipe: updated.recipe,
    startDate: updated.startDate,
    endDate: updated.endDate,
    status: updated.status,
    cost: updated.cost,
    createdAt: updated.createdAt,
  });
}

/** DELETE */
export async function DELETE(req, { params }) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const resolved = await params;
  const id = resolved?.id;
  if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  const existing = await getRunAndCheck(id, auth.businessId);
  if (!existing) return NextResponse.json({ message: "Üretim kaydı bulunamadı." }, { status: 404 });

  await prisma.production_run.delete({ where: { id } });
  return NextResponse.json({ message: "Silindi" });
}
