import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized or missing businessId" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id: employeeId } = resolvedParams;

    if (!employeeId) {
      return NextResponse.json({ error: "Eksik çalışan ID." }, { status: 400 });
    }

    const items = await prisma.employee_transaction.findMany({
      where: { businessId, employeeId },
      orderBy: { date: "desc" },
    });

    // Calculate balance
    // Positive balance = we owe the employee (SALARY_ACCRUAL, OTHER_ACCRUAL)
    // Negative balance = employee owes us or paid off (SALARY_PAYMENT, ADVANCE_PAYMENT, OTHER_DEDUCTION)
    let balance = 0;
    items.forEach((item) => {
      const amt = Number(item.amount) || 0;
      if (item.type === "SALARY_ACCRUAL" || item.type === "OTHER_ACCRUAL") {
        balance += amt;
      } else {
        balance -= amt;
      }
    });

    return NextResponse.json({ items, balance });
  } catch (error) {
    console.error("Employee transactions GET Error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized or missing businessId" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id: employeeId } = resolvedParams;

    if (!employeeId) {
      return NextResponse.json({ error: "Eksik çalışan ID." }, { status: 400 });
    }

    const data = await request.json();
    const { type, amount, date, description } = data;

    if (!type || !amount) {
      return NextResponse.json({ error: "Tip ve tutar zorunludur." }, { status: 400 });
    }

    const tx = await prisma.employee_transaction.create({
      data: {
        businessId,
        employeeId,
        type,
        amount: Number(amount),
        date: date ? new Date(date) : new Date(),
        description: description || null,
      },
    });

    return NextResponse.json(tx, { status: 201 });
  } catch (error) {
    console.error("Employee transaction POST Error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
