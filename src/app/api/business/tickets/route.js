import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const CATEGORIES = ["GENERAL", "BILLING", "TECHNICAL", "ACCOUNT", "OTHER"];

function safeInt(val, def) {
  const n = parseInt(String(val), 10);
  return Number.isNaN(n) ? def : Math.max(0, n);
}

function safeStr(val) {
  return val != null ? String(val).trim() : "";
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "BUSINESS") {
      return NextResponse.json({ success: false, error: "Yetkisiz." }, { status: 401 });
    }
    const businessId = session.user.businessId;
    if (!businessId) return NextResponse.json({ success: false, error: "İşletme bulunamadı." }, { status: 403 });

    const { searchParams } = new URL(request.url || "", "http://localhost");
    const page = safeInt(searchParams.get("page"), 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, safeInt(searchParams.get("pageSize"), DEFAULT_PAGE_SIZE));
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      prisma.support_ticket.findMany({
        where: { creatorType: "BUSINESS", businessId },
        orderBy: { updatedAt: "desc" },
        skip,
        take: pageSize,
        include: { _count: { select: { messages: true } } },
      }),
      prisma.support_ticket.count({ where: { creatorType: "BUSINESS", businessId } }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    return NextResponse.json({
      success: true,
      items,
      pagination: { page, pageSize, total, totalPages },
    });
  } catch (e) {
    console.error("Business tickets GET error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "BUSINESS") {
      return NextResponse.json({ success: false, error: "Yetkisiz." }, { status: 401 });
    }
    const businessId = session.user.businessId;
    if (!businessId) return NextResponse.json({ success: false, error: "İşletme bulunamadı." }, { status: 403 });

    const body = await request.json().catch(() => ({}));
    const subject = safeStr(body.subject);
    const bodyText = safeStr(body.body);
    if (!subject) return NextResponse.json({ success: false, error: "Konu zorunludur." }, { status: 400 });
    if (!bodyText) return NextResponse.json({ success: false, error: "Mesaj metni zorunludur." }, { status: 400 });

    const category = body.category && CATEGORIES.includes(body.category) ? body.category : "GENERAL";

    const ticket = await prisma.support_ticket.create({
      data: {
        subject,
        body: bodyText,
        creatorType: "BUSINESS",
        businessId,
        category,
      },
    });

    return NextResponse.json({ success: true, ticket }, { status: 201 });
  } catch (e) {
    console.error("Business tickets POST error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
