/**
 * İşletmenin gördüğü talepler: doğrudan (businessId) + dağıtımlı (kategori eşleşmesi, geçilmemiş).
 */

export async function loadBusinessLeadCategories(prisma, businessId) {
  const b = await prisma.business.findUnique({
    where: { id: businessId },
    select: {
      city: true,
      district: true,
      latitude: true,
      longitude: true,
      category: true,
      primaryCategoryId: true,
      businesscategory: { select: { categoryId: true } },
    },
  });
  const categoryIds = [];
  if (b?.primaryCategoryId) categoryIds.push(b.primaryCategoryId);
  for (const row of b?.businesscategory || []) {
    if (row.categoryId) categoryIds.push(row.categoryId);
  }
  const legacyCategory = b?.category?.trim() || null;
  return {
    biz: b,
    categoryIds,
    legacyCategory,
  };
}

export function businessMatchesDistributedLead(lead, categoryIds, legacyCategory) {
  if (lead.businessId != null || !lead.isDistributed) return false;
  if (lead.categoryId && categoryIds.includes(lead.categoryId)) return true;
  if (legacyCategory && lead.category && String(lead.category).trim() === legacyCategory) return true;
  return false;
}

export function canBusinessAccessLead(lead, businessId, categoryIds, legacyCategory) {
  if (lead.businessId === businessId) return true;
  return businessMatchesDistributedLead(lead, categoryIds, legacyCategory);
}

/**
 * @param {object} opts
 * @param {string} opts.businessId
 * @param {string[]} opts.categoryIds
 * @param {string|null} opts.legacyCategory
 * @param {string|null} [opts.status] — 'ALL' veya boş = filtre yok
 * @param {string|null} [opts.q] — arama metni
 */
export function buildBusinessLeadsWhere({
  businessId,
  categoryIds = [],
  legacyCategory = null,
  status = null,
  q = null,
}) {
  const qTrim = q != null ? String(q).trim() : "";
  const searchClause = qTrim
    ? {
        OR: [
          { name: { contains: qTrim } },
          { phone: { contains: qTrim } },
          { email: { contains: qTrim } },
          { message: { contains: qTrim } },
          { category: { contains: qTrim } },
          { title: { contains: qTrim } },
        ],
      }
    : null;

  const st = status && String(status).toUpperCase() !== "ALL" ? String(status).toUpperCase() : null;

  const directParts = [{ businessId }, { dismissedAt: null }];
  if (st) directParts.push({ status: st });
  if (searchClause) directParts.push(searchClause);
  const directWhere = { AND: directParts };

  const distributedCatOr = [];
  if (categoryIds.length) distributedCatOr.push({ categoryId: { in: categoryIds } });
  if (legacyCategory) distributedCatOr.push({ category: legacyCategory });

  if (!distributedCatOr.length) {
    return directWhere;
  }

  const distributedParts = [
    { businessId: null },
    { isDistributed: true },
    { OR: distributedCatOr },
    {
      NOT: {
        leadBusinessStates: {
          some: { businessId, dismissedAt: { not: null } },
        },
      },
    },
  ];

  if (st) {
    if (st === "NEW") {
      distributedParts.push({
        OR: [
          { leadBusinessStates: { none: { businessId } } },
          {
            leadBusinessStates: {
              some: { businessId, status: "NEW", dismissedAt: null },
            },
          },
        ],
      });
    } else {
      distributedParts.push({
        leadBusinessStates: {
          some: { businessId, status: st, dismissedAt: null },
        },
      });
    }
  }
  if (searchClause) distributedParts.push(searchClause);

  return { OR: [directWhere, { AND: distributedParts }] };
}

/** Şehir/ilçe önceliği: 0 = ikisi de eşleşti, 1 = şehir, 2 = diğer */
export function leadLocationTier(lead, bizCity, bizDistrict) {
  const lc = (lead.city || "").trim().toLowerCase();
  const ld = (lead.district || "").trim().toLowerCase();
  const bc = (bizCity || "").trim().toLowerCase();
  const bd = (bizDistrict || "").trim().toLowerCase();
  if (bc && bd && lc === bc && ld === bd) return 0;
  if (bc && lc === bc) return 1;
  return 2;
}

export function serializeLeadForBusiness(lead, businessId) {
  const row = lead.leadBusinessStates?.[0];
  const isDirect = lead.businessId === businessId;
  if (isDirect) {
    const { leadBusinessStates: _lb, ...rest } = lead;
    return rest;
  }
  const { leadBusinessStates: _lb, status: _s, dismissedAt: _d, replyText: _r, quotedPrice: _q, repliedAt: _rep, ...rest } =
    lead;
  return {
    ...rest,
    status: row?.status ?? "NEW",
    dismissedAt: row?.dismissedAt ?? null,
    replyText: row?.replyText ?? null,
    quotedPrice: row?.quotedPrice ?? null,
    repliedAt: row?.repliedAt ?? null,
  };
}
