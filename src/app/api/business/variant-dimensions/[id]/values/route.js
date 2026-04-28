import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function toStr(v) {
  return (v ?? "").toString().trim();
}

async function requireBusiness() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { err: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  if (!["BUSINESS", "ADMIN"].includes(session.user.role)) return { err: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  const businessId = session.user.businessId;
  if (!businessId) return { err: NextResponse.json({ message: "Business not found" }, { status: 404 }) };
  return { businessId };
}

/** POST — boyuta değer ekle */
export async function POST(req, { params }) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const resolved = typeof params?.then === "function" ? await params : params;
  const dimensionId = resolved?.id;
  if (!dimensionId) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  const dimension = await prisma.productvariantdimension.findFirst({
    where: { id: dimensionId, businessId: auth.businessId },
    select: { id: true },
  });
  if (!dimension) return NextResponse.json({ message: "Varyant bulunamadı." }, { status: 404 });

  const body = await req.json();
  const value = toStr(body?.value);
  if (!value || value.length < 1) {
    return NextResponse.json({ message: "Varyant değeri zorunludur." }, { status: 400 });
  }

  const lastVal = await prisma.productvariantdimensionvalue.findFirst({
    where: { dimensionId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const order = Number.isFinite(body?.order) ? Number(body.order) : (lastVal?.order ?? -1) + 1;

  try {
    const created = await prisma.productvariantdimensionvalue.create({
      data: { dimensionId, value, order },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    if (e?.code === "P2002") {
      return NextResponse.json({ message: "Bu değer bu varyant altında zaten var." }, { status: 400 });
    }
    throw e;
  }
}
