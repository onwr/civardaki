import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parseCustomerCategory } from "@/lib/customer-transaction";

function toIso(v) {
  return v ? new Date(v).toISOString() : null;
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function GET(_req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await params;
    const customerId = resolved?.id;
    if (!customerId) {
      return NextResponse.json({ error: "Müşteri bulunamadı." }, { status: 400 });
    }

    const [customer, business, sales, cashMovements, checks, notes] = await Promise.all([
      prisma.business_customer.findFirst({
        where: { id: customerId, businessId },
      }),
      prisma.business.findFirst({
        where: { id: businessId },
        select: {
          name: true,
          officialName: true,
          address: true,
          city: true,
          district: true,
          phone: true,
          email: true,
          taxOffice: true,
          taxId: true,
        },
      }),
      prisma.business_sale.findMany({
        where: { businessId, customerId },
        orderBy: { saleDate: "asc" },
        take: 500,
        include: {
          items: { select: { id: true, name: true, quantity: true, total: true, unitPrice: true } },
          cashAccount: { select: { id: true, name: true } },
        },
      }),
      prisma.cash_transaction.findMany({
        where: {
          businessId,
          category: { startsWith: `CUSTOMER:${customerId}:` },
        },
        orderBy: [{ date: "asc" }, { createdAt: "asc" }],
        take: 500,
        include: {
          account: { select: { id: true, name: true } },
        },
      }),
      prisma.cash_check.findMany({
        where: {
          businessId,
          notes: { contains: `"customerId":"${customerId}"` },
        },
        orderBy: { createdAt: "asc" },
        take: 200,
      }),
      prisma.cash_promissory_note.findMany({
        where: {
          businessId,
          notes: { contains: `"customerId":"${customerId}"` },
        },
        orderBy: { createdAt: "asc" },
        take: 200,
      }),
    ]);

    if (!customer) {
      return NextResponse.json({ error: "Müşteri bulunamadı." }, { status: 404 });
    }

    const openingBalance = num(customer.openingBalance);
    const currentBalance = num(customer.openBalance);

    /** @type {Array<{ id: string; date: string; description: string; borc: number; alacak: number; sortKey: string; kind: string; accountName?: string|null; items?: unknown[]; operation?: string|null }>} */
    const rawLines = [];

    for (const s of sales) {
      const d = s.saleDate || s.createdAt;
      rawLines.push({
        id: `sale-${s.id}`,
        date: toIso(d),
        description: s.description ? `Satış — ${s.description}` : "Satış",
        borc: num(s.totalAmount),
        alacak: num(s.collectionAmount),
        sortKey: `sale-${s.id}`,
        kind: "SALE",
        accountName: s.cashAccount?.name || null,
        items: s.items || [],
      });
    }

    for (const tx of cashMovements) {
      const parsed = parseCustomerCategory(tx.category);
      const amount = num(tx.amount);
      const borc = tx.type === "EXPENSE" ? amount : 0;
      const alacak = tx.type === "INCOME" ? amount : 0;
      rawLines.push({
        id: `tx-${tx.id}`,
        date: toIso(tx.date),
        description: tx.description || "Hareket",
        borc,
        alacak,
        sortKey: `tx-${tx.createdAt?.toISOString?.() || tx.id}-${tx.id}`,
        kind: "CASH",
        accountName: tx.account?.name || null,
        operation: parsed?.operation || null,
      });
    }

    rawLines.sort((a, b) => {
      const ta = new Date(a.date).getTime();
      const tb = new Date(b.date).getTime();
      if (ta !== tb) return ta - tb;
      if (a.kind !== b.kind) return a.kind === "SALE" ? -1 : 1;
      return String(a.sortKey).localeCompare(String(b.sortKey));
    });

    let running = openingBalance;
    const lines = rawLines.map((row) => {
      running = running + row.borc - row.alacak;
      return { ...row, balance: running };
    });

    const sumBorc = rawLines.reduce((s, r) => s + r.borc, 0);
    const sumAlacak = rawLines.reduce((s, r) => s + r.alacak, 0);
    const computedClosing = openingBalance + sumBorc - sumAlacak;

    return NextResponse.json(
      {
        generatedAt: new Date().toISOString(),
        business: business
          ? {
              name: business.officialName || business.name,
              address: business.address,
              city: business.city,
              district: business.district,
              phone: business.phone,
              email: business.email,
              taxOffice: business.taxOffice,
              taxId: business.taxId,
            }
          : null,
        customer: {
          id: customer.id,
          name: customer.name,
          customerClass: customer.customerClass,
          taxOffice: customer.taxOffice,
          taxId: customer.taxId,
          address: customer.address,
          mobilePhone: customer.mobilePhone,
          openingBalance,
          currentBalance,
        },
        summary: {
          openingBalance,
          sumBorc,
          sumAlacak,
          computedClosing,
          currentBalance,
          lineCount: lines.length,
        },
        lines,
        checks: checks.map((row) => ({
          id: row.id,
          amount: num(row.amount),
          status: row.status,
          checkNumber: row.checkNumber,
          bankName: row.bankName,
          dueDate: toIso(row.dueDate),
          createdAt: toIso(row.createdAt),
        })),
        notes: notes.map((row) => ({
          id: row.id,
          amount: num(row.amount),
          status: row.status,
          noteNumber: row.noteNumber,
          dueDate: toIso(row.dueDate),
          createdAt: toIso(row.createdAt),
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Customer statement GET Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
