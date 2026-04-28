import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function resolveParams(context) {
  const params = typeof context.params?.then === "function" ? await context.params : context.params || {};
  return params;
}

function safeStr(val) {
  return val != null ? String(val).trim() : "";
}

export async function POST(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["BUSINESS", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: "Yetkisiz." }, { status: 401 });
    }
    const businessId = session.user.businessId;
    const { id } = await resolveParams(context);
    if (!id) return NextResponse.json({ success: false, error: "ID gerekli." }, { status: 400 });

    const ticket = await prisma.support_ticket.findFirst({
      where: { id, creatorType: "BUSINESS", businessId },
    });
    if (!ticket) return NextResponse.json({ success: false, error: "Talep bulunamadı." }, { status: 404 });

    const body = await request.json().catch(() => ({}));
    const messageBody = safeStr(body.body);
    if (!messageBody) return NextResponse.json({ success: false, error: "Mesaj metni gerekli." }, { status: 400 });

    const message = await prisma.support_ticket_message.create({
      data: {
        supportTicketId: id,
        body: messageBody,
        authorType: "BUSINESS",
        authorBusinessId: businessId,
      },
    });

    await prisma.support_ticket.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (e) {
    console.error("Business ticket message POST error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
