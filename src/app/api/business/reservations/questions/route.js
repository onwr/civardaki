import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TYPES = ["TEXT", "SHORT_ANSWER", "SINGLE_CHOICE", "MULTI_CHOICE"];

async function ensureSettings(businessId) {
  let settings = await prisma.business_reservation_settings.findUnique({
    where: { businessId },
  });
  if (!settings) {
    settings = await prisma.business_reservation_settings.create({ data: { businessId } });
  }
  return settings;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const businessId = session?.user?.businessId;
    if (!businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const settings = await ensureSettings(businessId);
    const questions = await prisma.business_reservation_question.findMany({
      where: { settingsId: settings.id },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        options: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      },
    });
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("BUSINESS RESERVATION QUESTIONS GET ERROR:", error);
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
    const body = await req.json().catch(() => ({}));
    const label = String(body.label || "").trim();
    const type = String(body.type || "").toUpperCase();
    const isRequired = Boolean(body.isRequired);
    const isActive = body.isActive !== false;
    const sortOrder = Number(body.sortOrder) || 0;
    const options = Array.isArray(body.options) ? body.options : [];

    if (!label) {
      return NextResponse.json({ error: "Soru metni zorunludur." }, { status: 400 });
    }
    if (!TYPES.includes(type)) {
      return NextResponse.json({ error: "Soru tipi geçersiz." }, { status: 400 });
    }
    if ((type === "SINGLE_CHOICE" || type === "MULTI_CHOICE") && options.length < 2) {
      return NextResponse.json({ error: "Seçimli sorularda en az 2 seçenek olmalıdır." }, { status: 400 });
    }

    const settings = await ensureSettings(businessId);
    const created = await prisma.business_reservation_question.create({
      data: {
        settingsId: settings.id,
        label,
        type,
        isRequired,
        isActive,
        sortOrder,
        options: {
          create:
            type === "SINGLE_CHOICE" || type === "MULTI_CHOICE"
              ? options
                  .map((item, index) => ({
                    label: String(item || "").trim(),
                    sortOrder: index,
                  }))
                  .filter((item) => item.label)
              : [],
        },
      },
      include: {
        options: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      },
    });
    return NextResponse.json({ question: created });
  } catch (error) {
    console.error("BUSINESS RESERVATION QUESTIONS POST ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
