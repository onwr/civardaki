import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function uniqueAssetCode() {
  return `DMB-${crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const businessId = session.user.businessId;
    const { searchParams } = new URL(req.url || "", "http://localhost");
    const q = (searchParams.get("q") || "").trim().toLowerCase();

    const rows = await prisma.asset.findMany({
      where: { businessId },
      orderBy: [{ createdAt: "desc" }],
      take: 500,
    });

    let filtered = rows;
    if (q.length >= 3) {
      filtered = rows.filter((r) => {
        const hay = [
          r.name,
          r.assetCode,
          r.description,
          r.notes,
          r.location,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    return NextResponse.json({
      assets: filtered.map((r) => ({
        id: r.id,
        name: r.name,
        serialNo: r.assetCode,
        description: r.description,
        notes: r.notes,
        purchaseDate: r.purchaseDate,
        purchasePrice: r.purchasePrice,
        currentValue: r.currentValue,
        category: r.category,
        status: r.status,
        createdAt: r.createdAt,
      })),
    });
  } catch (e) {
    console.error("assets GET:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const businessId = session.user.businessId;
    const body = await req.json();
    const name = (body.name || "").trim();
    if (!name) {
      return NextResponse.json({ error: "Demirbaş adı gerekli" }, { status: 400 });
    }

    const serialNo = (body.serialNo || "").trim();
    const assetCode = serialNo || uniqueAssetCode();

    const existing = await prisma.asset.findFirst({
      where: { businessId, assetCode },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Bu seri / kod zaten kullanılıyor" },
        { status: 400 }
      );
    }

    let purchaseDate = null;
    if (body.purchaseDate) {
      const d = new Date(body.purchaseDate);
      if (!Number.isNaN(d.getTime())) purchaseDate = d;
    }

    let purchasePrice = 0;
    if (body.purchasePrice != null && body.purchasePrice !== "") {
      const p = parseFloat(body.purchasePrice);
      if (!Number.isNaN(p) && p >= 0) purchasePrice = p;
    }

    const asset = await prisma.asset.create({
      data: {
        id: crypto.randomUUID(),
        businessId,
        assetCode,
        name,
        description: body.description?.trim() || null,
        notes: body.notes?.trim() || null,
        purchaseDate,
        purchasePrice,
        currentValue: purchasePrice,
        category: body.category || "EQUIPMENT",
      },
    });

    return NextResponse.json({
      id: asset.id,
      name: asset.name,
      serialNo: asset.assetCode,
      description: asset.description,
      notes: asset.notes,
      purchaseDate: asset.purchaseDate,
      purchasePrice: asset.purchasePrice,
    });
  } catch (e) {
    console.error("assets POST:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
