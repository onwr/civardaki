import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function cleanPhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

export async function DELETE(_request, context) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Talep bulunamadı." }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phone: true,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
    }

    const sessionEmail = normalizeEmail(user.email);
    const sessionPhone = cleanPhone(user.phone);
    const leadEmail = normalizeEmail(lead.email);
    const leadPhone = cleanPhone(lead.phone);

    const emailMatch = Boolean(sessionEmail && leadEmail && sessionEmail === leadEmail);
    const phoneMatch = Boolean(sessionPhone && leadPhone && leadPhone.includes(sessionPhone));

    if (!emailMatch && !phoneMatch) {
      return NextResponse.json({ error: "Bu talebi silme yetkiniz yok." }, { status: 403 });
    }

    await prisma.lead.delete({ where: { id: lead.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("USER REQUEST DELETE ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
