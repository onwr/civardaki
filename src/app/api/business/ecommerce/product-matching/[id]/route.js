import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function normalizeStatus(value) {
  const raw = String(value || "").trim().toUpperCase();
  if (raw === "MATCHED" || raw === "PENDING" || raw === "NOT_LISTED") return raw;
  return null;
}

async function requireBusinessId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.businessId) return null;
  return session.user.businessId;
}

export async function PATCH(request, context) {
  try {
    const businessId = await requireBusinessId();
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const data = {};

    if (body.platformProductId !== undefined) {
      data.platformProductId = String(body.platformProductId || "").trim() || null;
    }
    if (body.platformProductName !== undefined) {
      data.platformProductName = String(body.platformProductName || "").trim() || null;
    }
    if (body.notes !== undefined) {
      data.notes = String(body.notes || "").trim() || null;
    }
    if (body.matchStatus !== undefined) {
      const normalized = normalizeStatus(body.matchStatus);
      if (!normalized) {
        return NextResponse.json({ error: "Geçersiz durum." }, { status: 400 });
      }
      data.matchStatus = normalized;
      data.lastSyncedAt = normalized === "MATCHED" ? new Date() : null;
    }

    if (!Object.keys(data).length) {
      return NextResponse.json({ error: "Güncellenecek alan yok." }, { status: 400 });
    }

    const current = await prisma.ecommerce_product_match.findFirst({
      where: { id, businessId },
      select: { id: true },
    });
    if (!current) {
      return NextResponse.json({ error: "Kayıt bulunamadı." }, { status: 404 });
    }

    await prisma.ecommerce_product_match.update({
      where: { id },
      data,
    });

    return NextResponse.json({ message: "Eşleştirme güncellendi." });
  } catch (error) {
    console.error("Ecommerce product-matching PATCH Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_request, context) {
  try {
    const businessId = await requireBusinessId();
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const current = await prisma.ecommerce_product_match.findFirst({
      where: { id, businessId },
      select: { id: true },
    });
    if (!current) {
      return NextResponse.json({ error: "Kayıt bulunamadı." }, { status: 404 });
    }

    await prisma.ecommerce_product_match.delete({ where: { id } });
    return NextResponse.json({ message: "Eşleştirme kaldırıldı." });
  } catch (error) {
    console.error("Ecommerce product-matching DELETE Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
