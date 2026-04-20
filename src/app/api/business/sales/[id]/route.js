import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function assertOwn(businessId, id) {
  return prisma.business_sale.findFirst({
    where: { id, businessId },
    include: {
      items: true,
      customer: { select: { id: true, name: true } },
      cashAccount: { select: { id: true, name: true } },
    },
  });
}

export async function GET(_req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const row = await assertOwn(session.user.businessId, id);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      sale: {
        ...row,
        saleDate: row.saleDate.toISOString(),
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      },
    });
  } catch (e) {
    console.error("Sale GET:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

function toNum(v) {
  if (v === null || v === undefined || v === "") return 0;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

const AMOUNT_EPS = 0.051;

export async function DELETE(_req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { id } = await params;
    const oldSale = await assertOwn(session.user.businessId, id);
    if (!oldSale) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      // 1. Eski kasa işlemini tersine çevir
      if (oldSale.collectionAmount > 0 && oldSale.cashAccountId) {
        await tx.cash_account.updateMany({
          where: { id: oldSale.cashAccountId, businessId: session.user.businessId },
          data: { balance: { decrement: oldSale.collectionAmount } },
        });
        await tx.cash_transaction.deleteMany({
          where: { businessId: session.user.businessId, description: { contains: oldSale.id } },
        });
      }

      // 2. Eski müşteri borcunu tersine çevir
      const oldRemaining = Math.max(0, oldSale.totalAmount - oldSale.collectionAmount);
      if (oldSale.customerId && oldRemaining > AMOUNT_EPS) {
        await tx.business_customer.updateMany({
          where: { id: oldSale.customerId, businessId: session.user.businessId },
          data: { openBalance: { decrement: oldRemaining } },
        });
      }

      // 3. Alt kalemleri ve satışın kendisini sil
      await tx.business_sale_item.deleteMany({ where: { saleId: id } });
      await tx.business_sale.delete({ where: { id, businessId: session.user.businessId } });
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Sale DELETE:", e);
    return NextResponse.json({ error: "Silme işlemi başarısız" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const businessId = session.user.businessId;
    const { id } = await params;
    const oldSale = await assertOwn(businessId, id);
    if (!oldSale) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const documentType = body.documentType || oldSale.documentType;
    const saleDate = body.saleDate ? new Date(body.saleDate) : oldSale.saleDate;
    const totalAmount = toNum(body.totalAmount);
    const collectionAmount = toNum(body.collectionAmount);
    const cashAccountId = body.cashAccountId || null;
    const description = body.description || null;
    const customerId = oldSale.customerId; 
    const items = Array.isArray(body.items) ? body.items : [];

    const linesTotal = items.reduce((sum, it) => sum + toNum(it.total), 0);
    const saleTotal = items.length > 0 ? linesTotal : totalAmount;

    if (items.length > 0 && Math.abs(linesTotal - totalAmount) > AMOUNT_EPS) {
      return NextResponse.json({ error: `Satır toplamı (${linesTotal.toFixed(2)} ₺) ile genel tutar (${totalAmount.toFixed(2)} ₺) uyuşmuyor.` }, { status: 400 });
    }
    if (collectionAmount > saleTotal + AMOUNT_EPS) {
      return NextResponse.json({ error: "Tahsilat tutarı satış toplamını aşamaz." }, { status: 400 });
    }
    if (collectionAmount > 0 && !cashAccountId) {
      return NextResponse.json({ error: "Tahsilat için kasa hesabı seçin." }, { status: 400 });
    }

    const remaining = Math.max(0, saleTotal - collectionAmount);

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Eski işlemleri tersine çevir
      if (oldSale.collectionAmount > 0 && oldSale.cashAccountId) {
        await tx.cash_account.updateMany({
          where: { id: oldSale.cashAccountId, businessId },
          data: { balance: { decrement: oldSale.collectionAmount } }
        });
        await tx.cash_transaction.deleteMany({
          where: { businessId, description: { contains: oldSale.id } }
        });
      }
      const oldRemaining = Math.max(0, oldSale.totalAmount - oldSale.collectionAmount);
      if (oldSale.customerId && oldRemaining > AMOUNT_EPS) {
        await tx.business_customer.updateMany({
          where: { id: oldSale.customerId, businessId },
          data: { openBalance: { decrement: oldRemaining } }
        });
      }

      // 2. Yeni kalemleri oluştur
      await tx.business_sale_item.deleteMany({ where: { saleId: id } });
      const sale = await tx.business_sale.update({
        where: { id },
        data: {
          documentType,
          saleDate,
          totalAmount: saleTotal,
          collectionAmount,
          cashAccountId: collectionAmount > 0 ? cashAccountId : null,
          description,
          items: {
            create: items.map(it => ({
              productId: it.productId || null,
              name: (it.name || "").slice(0, 500),
              quantity: toNum(it.quantity) || 1,
              unitPrice: toNum(it.unitPrice),
              total: toNum(it.total)
            }))
          }
        },
        include: { items: true }
      });

      // 3. Yeni işlemleri (Kasa & Cari) yansıt
      if (collectionAmount > 0) {
        await tx.cash_transaction.create({
          data: {
            id: crypto.randomUUID(),
            businessId,
            accountId: cashAccountId,
            type: "INCOME",
            amount: collectionAmount,
            category: "Satış",
            description: `Satış düzenlemesi · ${sale.id}`,
            date: saleDate,
          }
        });
        await tx.cash_account.updateMany({
          where: { id: cashAccountId },
          data: { balance: { increment: collectionAmount } }
        });
      }
      if (customerId && remaining > AMOUNT_EPS) {
        await tx.business_customer.updateMany({
          where: { id: customerId, businessId },
          data: { openBalance: { increment: remaining } }
        });
      }

      return sale;
    });

    return NextResponse.json({ sale: updated });
  } catch (e) {
    console.error("Sale PUT:", e);
    return NextResponse.json({ error: "Güncelleme başarısız oldu" }, { status: 500 });
  }
}

