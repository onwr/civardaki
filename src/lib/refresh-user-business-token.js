import { prisma } from "@/lib/prisma";

const userBusinessSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  phone: true,
  role: true,
  ownedbusiness: {
    select: {
      isPrimary: true,
      businessId: true,
      business: {
        select: {
          slug: true,
          name: true,
          isOpen: true,
        },
      },
    },
    orderBy: [{ isPrimary: "desc" }],
    take: 10,
  },
};

export async function loadUserBusinessContext(userId, email) {
  if (userId) {
    const byId = await prisma.user.findUnique({
      where: { id: String(userId) },
      select: userBusinessSelect,
    });
    if (byId) return byId;
  }

  if (email) {
    return prisma.user.findUnique({
      where: { email: String(email).toLowerCase().trim() },
      select: userBusinessSelect,
    });
  }

  return null;
}

export function applyOwnedBusinessToToken(token, dbUser) {
  if (!dbUser) return token;

  const primaryBusiness =
    dbUser.ownedbusiness?.find((item) => item.isPrimary) ||
    dbUser.ownedbusiness?.[0] ||
    null;

  const businessId = primaryBusiness?.businessId || null;
  const hasBusiness = (dbUser.ownedbusiness?.length ?? 0) > 0;

  token.id = dbUser.id;
  token.email = dbUser.email ?? token.email;
  token.name = dbUser.name ?? token.name;
  token.image = dbUser.image ?? null;
  token.phone = dbUser.phone ?? null;
  token.role = dbUser.role || "USER";
  token.hasBusiness = hasBusiness;
  token.businessId = businessId;
  token.businessSlug = primaryBusiness?.business?.slug || null;
  token.businessName = primaryBusiness?.business?.name || null;
  token.businessIsOpen = primaryBusiness?.business?.isOpen ?? true;

  return token;
}
