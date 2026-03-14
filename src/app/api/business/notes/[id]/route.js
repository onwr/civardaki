import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function normalizeColor(value) {
  const color = String(value || "blue").trim().toLowerCase();
  const allowed = new Set(["blue", "emerald", "purple", "rose", "amber", "slate"]);
  return allowed.has(color) ? color : "blue";
}

function normalizeTags(input) {
  if (Array.isArray(input)) {
    return input
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .slice(0, 20);
  }
  if (typeof input === "string") {
    return input
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 20);
  }
  return [];
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

    const current = await prisma.business_note.findFirst({
      where: { id, businessId, archivedAt: null },
      select: { id: true },
    });
    if (!current) {
      return NextResponse.json({ error: "Not bulunamadı." }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const data = {};

    if (body.title !== undefined) {
      const title = String(body.title || "").trim();
      if (!title) return NextResponse.json({ error: "Başlık boş olamaz." }, { status: 400 });
      data.title = title;
    }
    if (body.content !== undefined) {
      const content = String(body.content || "").trim();
      if (!content) return NextResponse.json({ error: "İçerik boş olamaz." }, { status: 400 });
      data.content = content;
    }
    if (body.category !== undefined) {
      data.category = String(body.category || "").trim() || "Genel";
    }
    if (body.color !== undefined) {
      data.color = normalizeColor(body.color);
    }
    if (body.tags !== undefined) {
      data.tags = normalizeTags(body.tags);
    }
    if (body.isPinned !== undefined) {
      data.isPinned = Boolean(body.isPinned);
    }

    if (!Object.keys(data).length) {
      return NextResponse.json({ error: "Güncellenecek alan yok." }, { status: 400 });
    }

    await prisma.business_note.update({
      where: { id },
      data,
    });

    return NextResponse.json({ message: "Not güncellendi." });
  } catch (error) {
    console.error("Business notes PATCH Error:", error);
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

    const current = await prisma.business_note.findFirst({
      where: { id, businessId, archivedAt: null },
      select: { id: true },
    });
    if (!current) {
      return NextResponse.json({ error: "Not bulunamadı." }, { status: 404 });
    }

    await prisma.business_note.update({
      where: { id },
      data: { archivedAt: new Date() },
    });

    return NextResponse.json({ message: "Not arşivlendi." });
  } catch (error) {
    console.error("Business notes DELETE Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
