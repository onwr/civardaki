import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TYPES = ["TEXT", "SHORT_ANSWER", "SINGLE_CHOICE", "MULTI_CHOICE"];

export async function PATCH(req, context) {
  try {
    const session = await getServerSession(authOptions);
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    const existing = await prisma.business_reservation_question.findFirst({
      where: { id, settings: { businessId } },
      include: { options: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Soru bulunamadı." }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const data = {};
    if (body.label !== undefined) data.label = String(body.label || "").trim();
    if (body.type !== undefined) {
      const type = String(body.type || "").toUpperCase();
      if (!TYPES.includes(type)) return NextResponse.json({ error: "Geçersiz soru tipi." }, { status: 400 });
      data.type = type;
    }
    if (body.isRequired !== undefined) data.isRequired = Boolean(body.isRequired);
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
    if (body.sortOrder !== undefined) {
      const n = Number(body.sortOrder);
      if (!Number.isNaN(n)) data.sortOrder = Math.max(0, Math.round(n));
    }

    const options = Array.isArray(body.options) ? body.options : null;
    if (options && (data.type === "SINGLE_CHOICE" || data.type === "MULTI_CHOICE" || existing.type === "SINGLE_CHOICE" || existing.type === "MULTI_CHOICE")) {
      const cleanOptions = options
        .map((item, index) => ({ label: String(item || "").trim(), sortOrder: index }))
        .filter((item) => item.label);
      if (cleanOptions.length < 2) {
        return NextResponse.json({ error: "Seçimli sorularda en az 2 seçenek olmalıdır." }, { status: 400 });
      }
      await prisma.business_reservation_question_option.deleteMany({ where: { questionId: id } });
      await prisma.business_reservation_question_option.createMany({
        data: cleanOptions.map((opt) => ({ questionId: id, ...opt })),
      });
    } else if (options && options.length === 0) {
      await prisma.business_reservation_question_option.deleteMany({ where: { questionId: id } });
    }

    const updated = await prisma.business_reservation_question.update({
      where: { id },
      data,
      include: {
        options: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      },
    });
    return NextResponse.json({ question: updated });
  } catch (error) {
    console.error("BUSINESS RESERVATION QUESTION PATCH ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req, context) {
  try {
    const session = await getServerSession(authOptions);
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    const existing = await prisma.business_reservation_question.findFirst({
      where: { id, settings: { businessId } },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Soru bulunamadı." }, { status: 404 });
    }
    await prisma.business_reservation_question.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("BUSINESS RESERVATION QUESTION DELETE ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
