import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const record = await prisma.platformsetting.findFirst();

    if (!record) {
      return NextResponse.json({
        success: true,
        settings: {
          design: {
            heroTitle: "Hizmet Piş, Ağzıma Düş",
            heroSubtitle: "İhtiyacın olan hizmete kolayca ulaş, bekleyen işlerini hallet",
            heroSearchPlaceholder: "Hangi hizmeti arıyorsun?",
            heroButtonText: "Ara",
          }
        }
      });
    }

    // Only expose non-sensitive sections to the public
    return NextResponse.json({
      success: true,
      settings: {
        design: record.design || {},
        general: {
          platformName: record.general?.platformName,
          metaDescription: record.general?.metaDescription,
        }
      }
    });

  } catch (error) {
    console.error("GET /api/public/settings error:", error);
    return NextResponse.json({ success: false, error: "Ayarlar yüklenemedi" }, { status: 500 });
  }
}
