import { prisma } from "@/lib/prisma";

/**
 * Public işletme detayı — GET /api/public/businesses/[slug] ile aynı JSON gövdesi.
 * @param {string} slug
 * @returns {Promise<{ business: object } | null>} null: bulunamadı veya pasif
 */
export async function getPublicBusinessBySlug(slug) {
  const s = typeof slug === "string" ? slug.trim() : "";
  if (!s) return null;

  const business = await prisma.business.findUnique({
    where: { slug: s },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      category: true,
      primaryCategoryId: true,
      primaryCategory: {
        select: { id: true, name: true, slug: true },
      },
      phone: true,
      email: true,
      website: true,
      address: true,
      city: true,
      district: true,
      rating: true,
      reviewCount: true,
      isActive: true,
      isVerified: true,
      isOpen: true,
      reservationEnabled: true,
      latitude: true,
      longitude: true,
      createdAt: true,
      avgResponseMinutes: true,
      responseCount: true,
      services: true,
      workingHours: true,
      reservationSettings: {
        select: {
          timezone: true,
          slotDurationMin: true,
          minNoticeMinutes: true,
          maxAdvanceDays: true,
          availability: {
            where: { isEnabled: true },
            select: {
              id: true,
              dayOfWeek: true,
              startTime: true,
              endTime: true,
            },
            orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
          },
          questions: {
            where: { isActive: true },
            select: {
              id: true,
              label: true,
              type: true,
              isRequired: true,
              sortOrder: true,
              options: {
                select: { id: true, label: true, sortOrder: true },
                orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
              },
            },
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
        },
      },
      media: {
        select: { url: true, type: true },
      },
      _count: {
        select: { lead: true },
      },
    },
  });

  if (!business || !business.isActive) return null;

  const { media, _count, primaryCategory, reservationSettings, ...rest } = business;
  return {
    business: {
      ...rest,
      logoUrl: media?.find((i) => i.type === "LOGO")?.url || null,
      coverUrl: media?.find((i) => i.type === "COVER")?.url || null,
      gallery: media?.filter((i) => i.type === "GALLERY")?.map((i) => i.url) || [],
      recentLeadCount: _count?.lead ?? 0,
      primaryCategory: primaryCategory
        ? { id: primaryCategory.id, name: primaryCategory.name, slug: primaryCategory.slug }
        : null,
      reservationConfig: reservationSettings
        ? {
            timezone: reservationSettings.timezone,
            slotDurationMin: reservationSettings.slotDurationMin,
            minNoticeMinutes: reservationSettings.minNoticeMinutes,
            maxAdvanceDays: reservationSettings.maxAdvanceDays,
            availability: reservationSettings.availability || [],
            questions: reservationSettings.questions || [],
          }
        : null,
    },
  };
}
