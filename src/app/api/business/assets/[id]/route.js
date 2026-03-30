import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function uniqueAssetCode() {
  return `DMB-${crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;
}

async function assertOwn(businessId, id) {
  return prisma.asset.findFirst({ where: { id, businessId } });
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
      ...row,
      serialNo: row.assetCode,
    });
  } catch (e) {
    console.error("assets [id] GET:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const businessId = session.user.businessId;
    const { id } = await params;
    const existing = await assertOwn(businessId, id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const data = {};

    if (body.name !== undefined) {
      const n = String(body.name).trim();
      if (!n) return NextResponse.json({ error: "Ad boş olamaz" }, { status: 400 });
      data.name = n;
    }
    if (body.description !== undefined) data.description = body.description?.trim() || null;
    if (body.notes !== undefined) data.notes = body.notes?.trim() || null;

    if (body.serialNo !== undefined) {
      const raw = body.serialNo;
      const code =
        raw === null || raw === ""
          ? uniqueAssetCode()
          : String(raw).trim() || uniqueAssetCode();
      const clash = await prisma.asset.findFirst({
        where: { businessId, assetCode: code, NOT: { id } },
      });
      if (clash) {
        return NextResponse.json({ error: "Bu seri / kod başka kayıtta kullanılıyor" }, { status: 400 });
      }
      data.assetCode = code;
    }

    if (body.purchaseDate !== undefined) {
      if (body.purchaseDate === null || body.purchaseDate === "") {
        data.purchaseDate = null;
      } else {
        const d = new Date(body.purchaseDate);
        if (Number.isNaN(d.getTime())) {
          return NextResponse.json({ error: "Geçersiz tarih" }, { status: 400 });
        }
        data.purchaseDate = d;
      }
    }

    if (body.purchasePrice !== undefined) {
      if (body.purchasePrice === null || body.purchasePrice === "") {
        data.purchasePrice = 0;
        data.currentValue = 0;
      } else {
        const p = parseFloat(body.purchasePrice);
        if (Number.isNaN(p) || p < 0) {
          return NextResponse.json({ error: "Geçersiz fiyat" }, { status: 400 });
        }
        data.purchasePrice = p;
        data.currentValue = p;
      }
    }

    const asset = await prisma.asset.update({ where: { id }, data });
    return NextResponse.json({
      ...asset,
      serialNo: asset.assetCode,
    });
  } catch (e) {
    console.error("assets PATCH:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const existing = await assertOwn(session.user.businessId, id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await prisma.asset.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("assets DELETE:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
