import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireBusiness() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { err: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
    if (!["BUSINESS", "ADMIN"].includes(session.user.role)) return { err: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
    const businessId = session.user.businessId;
    if (!businessId) return { err: NextResponse.json({ message: "Business not found" }, { status: 404 }) };
    return { businessId };
}

/** Marka ve raf yeri listeleri (ürünlerdeki tekil değerler) */
export async function GET() {
    const auth = await requireBusiness();
    if (auth.err) return auth.err;

    const [brandRows, shelfRows, brandMaster, shelfMaster] = await Promise.all([
        prisma.product.groupBy({
            by: ["brand"],
            where: { businessId: auth.businessId, brand: { not: null } },
        }),
        prisma.product.groupBy({
            by: ["shelfLocation"],
            where: { businessId: auth.businessId, shelfLocation: { not: null } },
        }),
        prisma.business_masterdata_entry.findMany({
            where: { businessId: auth.businessId, kind: "PRODUCT_BRAND" },
            select: { name: true },
        }),
        prisma.business_masterdata_entry.findMany({
            where: { businessId: auth.businessId, kind: "SHELF_LOCATION" },
            select: { name: true },
        }),
    ]);

    const brands = [
        ...new Set([
            ...brandRows.map((r) => r.brand).filter(Boolean),
            ...brandMaster.map((r) => r.name).filter(Boolean),
        ]),
    ].sort((a, b) => String(a).localeCompare(String(b), "tr"));

    const shelfLocations = [
        ...new Set([
            ...shelfRows.map((r) => r.shelfLocation).filter(Boolean),
            ...shelfMaster.map((r) => r.name).filter(Boolean),
        ]),
    ].sort((a, b) => String(a).localeCompare(String(b), "tr"));

    return NextResponse.json({ brands, shelfLocations });
}
