import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function makeId() {
  return `slide_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

const DEFAULT_SLIDES = [
  {
    id: makeId(),
    title: "Hizmet Piş, Ağzıma Düş",
    subtitle: "İhtiyacın olan hizmete kolayca ulaş, bekleyen işlerini hallet",
    searchPlaceholder: "Hangi hizmeti arıyorsun?",
    showSearch: true,
    bgImage: null,
    bgColor: "#004aad",
    badge: "",
    buttons: [{ id: "b1", text: "Keşfet", href: "/search", variant: "primary" }],
    active: true,
    order: 0,
    specialDayStart: null,
    specialDayEnd: null,
  },
];

async function getRecord() {
  return prisma.platformsetting.findFirst();
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  try {
    const record = await getRecord();
    const design = record?.design || {};
    const slides = design.heroSlides ?? DEFAULT_SLIDES;
    const config = {
      autoplay: design.heroAutoplay ?? true,
      interval: design.heroAutoplayInterval ?? 5000,
      transition: design.heroTransition ?? "fade",
    };
    return NextResponse.json({ success: true, slides, config });
  } catch (e) {
    return NextResponse.json({ error: "Yüklenemedi." }, { status: 500 });
  }
}

export async function PATCH(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const { slides, config } = body;

    let record = await getRecord();
    const currentDesign = (record?.design || {});

    const newDesign = {
      ...currentDesign,
      heroSlides: slides ?? currentDesign.heroSlides ?? DEFAULT_SLIDES,
      heroAutoplay: config?.autoplay ?? currentDesign.heroAutoplay ?? true,
      heroAutoplayInterval: config?.interval ?? currentDesign.heroAutoplayInterval ?? 5000,
      heroTransition: config?.transition ?? currentDesign.heroTransition ?? "fade",
    };

    if (!record) {
      record = await prisma.platformsetting.create({
        data: { general: {}, security: {}, notifications: {}, api: {}, design: newDesign },
      });
    } else {
      record = await prisma.platformsetting.update({
        where: { id: record.id },
        data: { design: newDesign },
      });
    }

    const updated = record.design;
    return NextResponse.json({
      success: true,
      slides: updated.heroSlides,
      config: {
        autoplay: updated.heroAutoplay,
        interval: updated.heroAutoplayInterval,
        transition: updated.heroTransition,
      },
    });
  } catch (e) {
    console.error("PATCH /api/admin/hero error:", e);
    return NextResponse.json({ error: "Kaydedilemedi." }, { status: 500 });
  }
}
