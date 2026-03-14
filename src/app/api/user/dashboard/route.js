import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ACTIVE_ORDER_STATUSES = ["PENDING", "CONFIRMED", "PREPARING", "ON_THE_WAY"];

/**
 * GET /api/user/dashboard – Giriş yapmış kullanıcı için dashboard verisi.
 * Session zorunludur.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
    }

    const userId = session.user.id;
    const userName = session.user.name || "";

    const [userRecord, addresses, orders, orderCount, activeOrderRow, upcomingEvent, popularBusinessesRaw] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true },
      }),
      prisma.user_address.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { city: true, district: true, line1: true, line2: true },
      }),
      prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { business: { select: { name: true, slug: true } } },
      }),
      prisma.order.count({ where: { userId } }),
      prisma.order.findFirst({
        where: {
          userId,
          status: { in: ACTIVE_ORDER_STATUSES },
        },
        orderBy: { createdAt: "desc" },
        include: {
          business: {
            select: {
              id: true,
              name: true,
              slug: true,
              media: {
                where: { type: "LOGO" },
                select: { url: true },
                take: 1,
              },
            },
          },
        },
      }),
      prisma.calendar_event.findFirst({
        where: {
          customerName: userName,
          startTime: { gte: new Date() },
          status: { in: ["CONFIRMED", "PENDING"] },
        },
        orderBy: { startTime: "asc" },
        include: {
          business: {
            select: {
              id: true,
              name: true,
              slug: true,
              media: {
                where: { type: "LOGO" },
                select: { url: true },
                take: 1,
              },
            },
          },
        },
      }),
      prisma.business.findMany({
        where: { isActive: true },
        orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
        take: 4,
        select: {
          id: true,
          slug: true,
          name: true,
          city: true,
          district: true,
          category: true,
          rating: true,
          reviewCount: true,
          isOpen: true,
          avgResponseMinutes: true,
          _count: { select: { lead: true } },
          media: { select: { url: true, type: true } },
        },
      }),
    ]);

    const firstAddress = addresses[0];
    const location = firstAddress
      ? {
          city: firstAddress.city || "",
          district: firstAddress.district || "",
          address: [firstAddress.line1, firstAddress.line2].filter(Boolean).join(", "),
        }
      : null;

    const totalOrders = orderCount ?? 0;
    const totalSpent = orders
      .filter((o) => o.status === "DELIVERED")
      .reduce((sum, o) => sum + (o.total != null ? Number(o.total) : 0), 0);

    const user = {
      displayName: userRecord?.name || userName || "Kullanıcı",
      firstName: (userRecord?.name || userName || "").split(/\s+/)[0] || "Kullanıcı",
    };

    const stats = {
      loyaltyPoints: 0,
      totalOrders,
      spendingLimit: totalSpent,
      activeCoupons: 0,
    };

    let activeOrder = null;
    if (activeOrderRow) {
      const biz = activeOrderRow.business;
      activeOrder = {
        id: activeOrderRow.id,
        orderNumber: activeOrderRow.orderNumber,
        businessName: biz?.name || "",
        businessSlug: biz?.slug || "",
        businessLogo: biz?.media?.[0]?.url || null,
        courierName: null,
        etaMinutes: null,
        total: activeOrderRow.total != null ? Number(activeOrderRow.total) : 0,
        status: String(activeOrderRow.status).toLowerCase(),
      };
    }

    let upcomingAppointment = null;
    if (upcomingEvent) {
      const biz = upcomingEvent.business;
      upcomingAppointment = {
        id: upcomingEvent.id,
        title: upcomingEvent.title,
        businessName: biz?.name || "",
        providerName: biz?.name || "",
        businessSlug: biz?.slug || null,
        image: biz?.media?.[0]?.url || null,
        dateTime: upcomingEvent.startTime,
        status: String(upcomingEvent.status).toLowerCase(),
      };
    }

    const quickActions = [
      { label: "TEKRAR SİPARİŞ", sub: "Siparişlerim", icon: "repeat", href: "/user/orders" },
      { label: "ACİL USTA", sub: "Tesisat & Elektrik", icon: "wrench", href: "/user/isletmeler?category=hizmet" },
      { label: "FAVORİLERİM", sub: "Hızlı Erişim", icon: "heart", href: "/user/profile?tab=addresses" },
      { label: "CANLI DESTEK", sub: "Yardım", icon: "message", href: "/user/settings" },
    ];

    const popularBusinesses = (popularBusinessesRaw || []).map((b) => {
      const mediaList = Array.isArray(b.media) ? b.media : [];
      const logoUrl = mediaList.find((m) => m.type === "LOGO")?.url || null;
      const coverUrl = mediaList.find((m) => m.type === "COVER")?.url || null;
      return {
        id: b.id,
        slug: b.slug,
        name: b.name,
        city: b.city,
        district: b.district,
        category: b.category,
        subcategory: b.category,
        rating: b.rating != null ? Number(b.rating) : 0,
        reviewCount: b.reviewCount || 0,
        isOpen: b.isOpen !== false,
        logo: logoUrl,
        banner: coverUrl || logoUrl,
        distance: null,
        avgResponseMinutes: b.avgResponseMinutes || 0,
        monthlyLeadCount: b._count?.lead || 0,
      };
    });

    const recentActivities = orders.slice(0, 8).map((o) => {
      const date = o.createdAt ? new Date(o.createdAt) : new Date();
      let icon = "🛒";
      let title = "Sipariş verildi";
      if (o.status === "DELIVERED") {
        icon = "✅";
        title = "Sipariş tamamlandı";
      } else if (ACTIVE_ORDER_STATUSES.includes(o.status)) {
        icon = "📦";
        title = "Sipariş yolda";
      }
      return {
        id: o.id,
        type: "order",
        title: `${title} · ${o.business?.name || "İşletme"}`,
        date,
        icon,
      };
    });

    const recentlyViewedBusinesses = [];

    return NextResponse.json({
      user,
      location,
      stats,
      activeOrder,
      upcomingAppointment,
      quickActions,
      popularBusinesses,
      recentlyViewedBusinesses,
      recentActivities,
    });
  } catch (err) {
    console.error("GET /api/user/dashboard error:", err);
    return NextResponse.json(
      { error: "Dashboard yüklenemedi." },
      { status: 500 }
    );
  }
}
