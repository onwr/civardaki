import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const record = await prisma.platformsetting.findFirst();
    if (!record || !record.design) {
      return NextResponse.json({ slides: [], config: {} });
    }

    const design = record.design;
    const allSlides = design.heroSlides || [];
    const now = new Date();

    // Filter slides: active and within date range if specified
    const activeSlides = allSlides.filter(slide => {
      if (!slide.active) return false;

      // Special day date range check
      if (slide.specialDayStart) {
        const start = new Date(slide.specialDayStart);
        if (now < start) return false;
      }
      if (slide.specialDayEnd) {
        const end = new Date(slide.specialDayEnd);
        if (now > end) return false;
      }

      return true;
    }).sort((a, b) => (a.order || 0) - (b.order || 0));

    return NextResponse.json({
      success: true,
      slides: activeSlides,
      config: {
        autoplay: design.heroAutoplay ?? true,
        interval: design.heroAutoplayInterval ?? 5000,
        transition: design.heroTransition ?? "fade",
      }
    });
  } catch (e) {
    console.error("Public Hero API error:", e);
    return NextResponse.json({ success: false, slides: [] }, { status: 500 });
  }
}
