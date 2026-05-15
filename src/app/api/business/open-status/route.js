import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBusinessSession } from "@/lib/require-business-api";

/** GET - mevcut açık/kapalı durumu */
export async function GET() {
  const auth = await requireBusinessSession();
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
  const auth = await requireBusinessSession();
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
