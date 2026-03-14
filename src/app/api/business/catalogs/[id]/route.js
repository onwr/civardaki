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

async function getCatalogAndCheck(id, businessId) {
  const c = await prisma.catalog.findFirst({
    where: { id, businessId },
    include: { items: { select: { productId: true, order: true } }, _count: { select: { items: true } } },
  });
  return c;
}

/** GET - single catalog with productIds */
export async function GET(req, { params }) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const resolved = await params;
  const id = resolved?.id;
  if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  const catalog = await getCatalogAndCheck(id, auth.businessId);
  if (!catalog) return NextResponse.json({ message: "Katalog bulunamadı." }, { status: 404 });

  const productIds = catalog.items.sort((a, b) => a.order - b.order).map((i) => i.productId);

  return NextResponse.json({
    id: catalog.id,
    name: catalog.name,
    description: catalog.description,
    isPublished: catalog.isPublished,
    pdfUrl: catalog.pdfUrl,
    shareUrl: catalog.shareUrl,
    createdAt: catalog.createdAt,
    updatedAt: catalog.updatedAt,
    productCount: catalog._count.items,
    productIds,
  });
}

/** PATCH - update catalog */
export async function PATCH(req, { params }) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const resolved = await params;
  const id = resolved?.id;
  if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  const existing = await getCatalogAndCheck(id, auth.businessId);
  if (!existing) return NextResponse.json({ message: "Katalog bulunamadı." }, { status: 404 });

  const body = await req.json();
  const name = body?.name !== undefined ? toStr(body.name) : undefined;
  const description = body?.description !== undefined ? (toStr(body.description) || null) : undefined;
  const isPublished = typeof body?.isPublished === "boolean" ? body.isPublished : undefined;
  const productIds = Array.isArray(body?.productIds) ? body.productIds.filter((id) => typeof id === "string" && id) : undefined;

  if (name !== undefined && name.length < 2) return NextResponse.json({ message: "Katalog adı en az 2 karakter olmalı." }, { status: 400 });

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (isPublished !== undefined) updateData.isPublished = isPublished;
  if (isPublished === true && existing.shareUrl === null) {
    const slug = existing.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    updateData.shareUrl = `https://civardaki.com/catalog/${slug}-${existing.id.slice(0, 6)}`;
  }

  if (productIds !== undefined) {
    const businessProducts = await prisma.product.findMany({
      where: { businessId: auth.businessId, id: { in: productIds } },
      select: { id: true },
    });
    const validIds = businessProducts.map((p) => p.id);
    await prisma.catalogitem.deleteMany({ where: { catalogId: id } });
    await prisma.catalogitem.createMany({
      data: validIds.map((productId, index) => ({ catalogId: id, productId, order: index })),
    });
  }

  const updated = await prisma.catalog.update({
    where: { id },
    data: updateData,
    include: { _count: { select: { items: true } } },
  });

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    description: updated.description,
    isPublished: updated.isPublished,
    pdfUrl: updated.pdfUrl,
    shareUrl: updated.shareUrl,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
    productCount: updated._count.items,
  });
}

/** DELETE - delete catalog */
export async function DELETE(req, { params }) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const resolved = await params;
  const id = resolved?.id;
  if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  const existing = await getCatalogAndCheck(id, auth.businessId);
  if (!existing) return NextResponse.json({ message: "Katalog bulunamadı." }, { status: 404 });

  await prisma.catalog.delete({ where: { id } });
  return NextResponse.json({ message: "Silindi" });
}
