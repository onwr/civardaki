import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireBusiness() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { err: NextResponse.json({ message: "Unauthorized" }, { status: 401 })};
  if (!["BUSINESS", "ADMIN"].includes(session.user.role)) return { err: NextResponse.json({ message: "Forbidden" }, { status: 403 })};
  const businessId = session.user.businessId;
  if (!businessId) return { err: NextResponse.json({ message: "Business not found" }, { status: 404 })};
  return { businessId };
}

/** GET - mevcut açık/kapalı durumu */
export async function GET() {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const business = await prisma.business.findUnique({
    where: { id: auth.businessId },
    select: { isOpen: true },
  });
  if (!business) return NextResponse.json({ message: "Business not found" }, { status: 404 });

  return NextResponse.json({ isOpen: business.isOpen ?? true });
}

/** PATCH - açık/kapalı durumunu güncelle. Body: { isOpen: boolean } */
export async function PATCH(request) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  let body;
  try {
    body = await request.json();
  } catch (_) {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }
  const isOpen = body && typeof body.isOpen === "boolean" ? body.isOpen : undefined;
  if (isOpen === undefined) return NextResponse.json({ message: "isOpen (boolean) required" }, { status: 400 });

  const business = await prisma.business.update({
    where: { id: auth.businessId },
    data: { isOpen },
    select: { isOpen: true },
  });

  return NextResponse.json({ isOpen: business.isOpen });
}
