import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function resolveParams(context) {
  const params = typeof context.params?.then === "function" ? await context.params : context.params || {};
  return params;
}

export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Oturum gerekli." }, { status: 401 });
    }
    const userId = session.user.id;
    const { id } = await resolveParams(context);
    if (!id) return NextResponse.json({ success: false, error: "ID gerekli." }, { status: 400 });

    const ticket = await prisma.support_ticket.findFirst({
      where: { id, creatorType: "USER", userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { id: true, name: true, email: true } },
            business: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
    if (!ticket) return NextResponse.json({ success: false, error: "Talep bulunamadı." }, { status: 404 });

    return NextResponse.json({ success: true, ticket });
  } catch (e) {
    console.error("User ticket GET error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
