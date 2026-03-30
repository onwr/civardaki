import { prisma } from "@/lib/prisma";

/**
 * İşletme için hafif özet metni (LLM sistem promptu).
 * @param {string | null | undefined} businessId
 * @returns {Promise<string>}
 */
export async function getBusinessAiBrief(businessId) {
  if (!businessId) return "";

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [business, activeProductCount, ordersLast30Days, distinctCustomerRows] = await Promise.all([
    prisma.business.findUnique({
      where: { id: businessId },
      select: {
        name: true,
        city: true,
        district: true,
        isActive: true,
        isOpen: true,
        reviewCount: true,
        rating: true,
      },
    }),
    prisma.product.count({
      where: { businessId, isActive: true },
    }),
    prisma.order.count({
      where: {
        businessId,
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.$queryRaw`
      SELECT COUNT(DISTINCT userId) AS c
      FROM \`order\`
      WHERE businessId = ${businessId} AND userId IS NOT NULL
    `,
  ]);

  if (!business) return "";

  const uniqueCustomers = Number(distinctCustomerRows[0]?.c ?? 0);

  const lines = [
    `İşletme adı: ${business.name}`,
    `Konum: ${[business.district, business.city].filter(Boolean).join(", ") || "—"}`,
    `İşletme durumu: ${business.isActive ? "aktif" : "pasif"}, şu an ${business.isOpen ? "açık" : "kapalı"}`,
    `Aktif ürün sayısı: ${activeProductCount}`,
    `Son 30 gün sipariş adedi: ${ordersLast30Days}`,
    `Kayıtlı kullanıcıdan gelen benzersiz sipariş veren sayısı: ${uniqueCustomers}`,
    `Değerlendirme: ortalama ${business.rating?.toFixed?.(1) ?? business.rating}, yorum sayısı ${business.reviewCount}`,
  ];

  return lines.join("\n");
}
