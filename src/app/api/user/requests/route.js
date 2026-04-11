import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function cleanPhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = String(user.email || "").trim().toLowerCase();
    const phoneDigits = cleanPhone(user.phone);
    const orFilters = [];

    if (email) {
      orFilters.push({ email: { equals: email } });
    }
    if (phoneDigits) {
      orFilters.push({ phone: { contains: phoneDigits } });
    }

    if (orFilters.length === 0) {
      return NextResponse.json({ requests: [] });
    }

    const leads = await prisma.lead.findMany({
      where: { OR: orFilters },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        status: true,
        name: true,
        phone: true,
        email: true,
        message: true,
        title: true,
        category: true,
        city: true,
        district: true,
        source: true,
        quotedPrice: true,
        createdAt: true,
        updatedAt: true,
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            district: true,
            media: {
              where: { type: "LOGO" },
              select: { url: true },
              take: 1,
            },
          },
        },
      },
    });

    const requests = leads.map((lead) => ({
      id: lead.id,
      status: lead.status,
      title: lead.title || "",
      category: lead.category || "",
      message: lead.message || "",
      city: lead.city || null,
      district: lead.district || null,
      source: lead.source,
      quotedPrice: lead.quotedPrice ?? null,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
      business: lead.business
        ? {
            id: lead.business.id,
            name: lead.business.name,
            slug: lead.business.slug,
            city: lead.business.city,
            district: lead.business.district,
            logoUrl: lead.business.media?.[0]?.url || null,
          }
        : null,
    }));

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("USER REQUESTS GET ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
