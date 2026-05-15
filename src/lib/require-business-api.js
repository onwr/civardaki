import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canCallBusinessApi } from "@/lib/session-business-access";

export async function resolveBusinessIdFromSession(session) {
  if (!session?.user) return null;
  if (session.user.businessId) return session.user.businessId;

  if (!session.user.id) return null;

  const fallback = await prisma.ownedbusiness.findFirst({
    where: { userId: session.user.id },
    select: { businessId: true },
    orderBy: [{ isPrimary: "desc" }],
  });

  return fallback?.businessId || null;
}

/** Route handler'lar için: { session, businessId } veya { err } */
export async function requireBusinessSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { err: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }
  if (!canCallBusinessApi(session.user)) {
    return { err: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }

  const businessId = await resolveBusinessIdFromSession(session);
  if (!businessId) {
    return { err: NextResponse.json({ message: "Business not found" }, { status: 404 }) };
  }

  return { session, businessId };
}
