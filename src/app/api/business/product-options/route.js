import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canCallBusinessApi } from "@/lib/session-business-access";

/** Ürünlerde geçen marka ve raf alanları — vitrin ürün yönetimi için basit öneri listesi */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.businessId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (!canCallBusinessApi(session.user)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const businessId = session.user.businessId;
  const rows = await prisma.product.findMany({
    where: { businessId },
    select: { brand: true, shelfLocation: true },
  });

  const brands = [
    ...new Set(rows.map((r) => r.brand).filter((b) => b && String(b).trim())),
  ].sort((a, b) => String(a).localeCompare(String(b), "tr"));

  const shelfLocations = [
    ...new Set(rows.map((r) => r.shelfLocation).filter((s) => s && String(s).trim())),
  ].sort((a, b) => String(a).localeCompare(String(b), "tr"));

  return NextResponse.json({ brands, shelfLocations });
}
