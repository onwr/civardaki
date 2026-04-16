import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await prisma.supplier_category.findMany({
      where: { businessId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error("Supplier categories GET Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const name = String(body?.name || "").trim();
    if (!name) {
      return NextResponse.json({ error: "Kategori adı zorunludur." }, { status: 400 });
    }

    const created = await prisma.supplier_category.create({
      data: {
        businessId,
        name: name.slice(0, 120),
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Bu kategori zaten var." }, { status: 409 });
    }
    console.error("Supplier categories POST Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
