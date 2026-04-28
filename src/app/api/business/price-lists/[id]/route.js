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

async function getListBase(id, businessId) {
  return prisma.pricelist.findFirst({
    where: { id, businessId },
    include: { _count: { select: { items: true } } },
  });
}

function mapListResponse(list, extra = {}) {
  return {
    id: list.id,
    name: list.name,
    description: list.description,
    customerGroup: list.customerGroup,
    discountRate: list.discountRate,
    validFrom: list.validFrom,
    validUntil: list.validUntil,
    isActive: list.isActive,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
    productCount: list._count.items,
    ...extra,
  };
}

/** GET - single price list with line items + product snapshot */
export async function GET(req, { params }) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const resolved = await params;
  const id = resolved?.id;
  if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  const list = await prisma.pricelist.findFirst({
    where: { id, businessId: auth.businessId },
    include: {
      items: {
        orderBy: { order: "asc" },
        include: {
          product: { select: { id: true, name: true, slug: true, price: true, discountPrice: true } },
        },
      },
      _count: { select: { items: true } },
    },
  });
  if (!list) return NextResponse.json({ message: "Fiyat listesi bulunamadı." }, { status: 404 });

  const items = list.items.map((row) => ({
    id: row.id,
    productId: row.productId,
    order: row.order,
    productName: row.product.name,
    slug: row.product.slug,
    price: row.product.price,
    discountPrice: row.product.discountPrice,
  }));

  return NextResponse.json(
    mapListResponse(list, {
      productIds: list.items.map((i) => i.productId),
      items,
    })
  );
}

async function appendProductsToList(pricelistId, businessId, candidateIds) {
  if (!candidateIds.length) return;
  const businessProducts = await prisma.product.findMany({
    where: { businessId, id: { in: candidateIds } },
    select: { id: true },
  });
  const existing = await prisma.pricelistitem.findMany({
    where: { pricelistId },
    select: { productId: true, order: true },
  });
  const have = new Set(existing.map((e) => e.productId));
  const maxOrder = existing.reduce((m, e) => Math.max(m, e.order), -1);
  const newIds = businessProducts.map((p) => p.id).filter((pid) => !have.has(pid));
  if (!newIds.length) return;
  await prisma.pricelistitem.createMany({
    data: newIds.map((productId, index) => ({
      pricelistId,
      productId,
      order: maxOrder + 1 + index,
    })),
  });
}

/** PATCH - productIds tam liste; add/remove/addByCategoryId/addByBrand kısmi (kategori ve marka AND) */
export async function PATCH(req, { params }) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const resolved = await params;
  const id = resolved?.id;
  if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  const existing = await getListBase(id, auth.businessId);
  if (!existing) return NextResponse.json({ message: "Fiyat listesi bulunamadı." }, { status: 404 });

  const body = await req.json();
  const name = body?.name !== undefined ? toStr(body.name) : undefined;
  const description = body?.description !== undefined ? toStr(body.description) || null : undefined;
  const customerGroup = body?.customerGroup !== undefined ? toStr(body.customerGroup) || "ALL" : undefined;
  const discountRate = body?.discountRate !== undefined ? Math.max(0, Math.min(100, Number(body.discountRate) || 0)) : undefined;
  const validFrom = body?.validFrom !== undefined ? new Date(body.validFrom) : undefined;
  const validUntil = body?.validUntil !== undefined ? new Date(body.validUntil) : undefined;
  const isActive = typeof body?.isActive === "boolean" ? body.isActive : undefined;
  const productIds = Array.isArray(body?.productIds) ? body.productIds.filter((i) => typeof i === "string" && i) : undefined;
  const addProductIds = Array.isArray(body?.addProductIds)
    ? [...new Set(body.addProductIds.filter((i) => typeof i === "string" && i))]
    : undefined;
  const removeProductIds = Array.isArray(body?.removeProductIds)
    ? [...new Set(body.removeProductIds.filter((i) => typeof i === "string" && i))]
    : undefined;
  const addByCategoryId = body?.addByCategoryId !== undefined ? toStr(body.addByCategoryId) : undefined;
  const addByBrand = body?.addByBrand !== undefined ? toStr(body.addByBrand) : undefined;

  if (name !== undefined && name.length < 2) {
    return NextResponse.json({ message: "Fiyat listesi adı en az 2 karakter olmalı." }, { status: 400 });
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (customerGroup !== undefined) updateData.customerGroup = customerGroup;
  if (discountRate !== undefined) updateData.discountRate = discountRate;
  if (validFrom !== undefined) updateData.validFrom = validFrom;
  if (validUntil !== undefined) updateData.validUntil = validUntil;
  if (isActive !== undefined) updateData.isActive = isActive;

  if (productIds !== undefined) {
    const businessProducts = await prisma.product.findMany({
      where: { businessId: auth.businessId, id: { in: productIds } },
      select: { id: true },
    });
    const validIds = businessProducts.map((p) => p.id);
    await prisma.pricelistitem.deleteMany({ where: { pricelistId: id } });
    await prisma.pricelistitem.createMany({
      data: validIds.map((productId, index) => ({ pricelistId: id, productId, order: index })),
    });
  } else {
    if (removeProductIds?.length) {
      const ok = await prisma.product.findMany({
        where: { businessId: auth.businessId, id: { in: removeProductIds } },
        select: { id: true },
      });
      const ids = ok.map((p) => p.id);
      if (ids.length) {
        await prisma.pricelistitem.deleteMany({
          where: { pricelistId: id, productId: { in: ids } },
        });
      }
    }
    if (addProductIds?.length) {
      await appendProductsToList(id, auth.businessId, addProductIds);
    }

    const hasCatFilter = Boolean(addByCategoryId);
    const hasBrandFilter = Boolean(addByBrand);
    if (hasCatFilter || hasBrandFilter) {
      const where = { businessId: auth.businessId };
      if (hasCatFilter) {
        const cat = await prisma.productcategory.findFirst({
          where: { id: addByCategoryId, businessId: auth.businessId },
          select: { id: true },
        });
        if (!cat) {
          return NextResponse.json({ message: "Kategori bulunamadı." }, { status: 400 });
        }
        where.categoryId = cat.id;
      }
      if (hasBrandFilter) {
        where.brand = addByBrand;
      }
      const prods = await prisma.product.findMany({
        where,
        select: { id: true },
      });
      await appendProductsToList(
        id,
        auth.businessId,
        prods.map((p) => p.id)
      );
    }
  }

  const hasScalar = Object.keys(updateData).length > 0;
  const updated = hasScalar
    ? await prisma.pricelist.update({
        where: { id },
        data: updateData,
        include: { _count: { select: { items: true } } },
      })
    : await prisma.pricelist.findFirst({
        where: { id },
        include: { _count: { select: { items: true } } },
      });

  if (!updated) return NextResponse.json({ message: "Fiyat listesi bulunamadı." }, { status: 404 });

  return NextResponse.json(mapListResponse(updated));
}

/** DELETE - delete price list */
export async function DELETE(req, { params }) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const resolved = await params;
  const id = resolved?.id;
  if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  const existing = await getListBase(id, auth.businessId);
  if (!existing) return NextResponse.json({ message: "Fiyat listesi bulunamadı." }, { status: 404 });

  await prisma.pricelist.delete({ where: { id } });
  return NextResponse.json({ message: "Silindi" });
}
