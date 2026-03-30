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
  if (session.user.role !== "BUSINESS") return { err: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  const businessId = session.user.businessId;
  if (!businessId) return { err: NextResponse.json({ message: "Business not found" }, { status: 404 }) };
  return { businessId };
}

/** GET — tüm boyutlar + değerler */
export async function GET() {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const items = await prisma.productvariantdimension.findMany({
    where: { businessId: auth.businessId },
    include: {
      values: { orderBy: [{ order: "asc" }, { value: "asc" }] },
    },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(items);
}

/** POST — yeni boyut */
export async function POST(req) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const body = await req.json();
  const name = toStr(body?.name);
  if (!name || name.length < 1) {
    return NextResponse.json({ message: "Varyant adı zorunludur." }, { status: 400 });
  }

  const lastDim = await prisma.productvariantdimension.findFirst({
    where: { businessId: auth.businessId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const order = Number.isFinite(body?.order) ? Number(body.order) : (lastDim?.order ?? -1) + 1;

  const created = await prisma.productvariantdimension.create({
    data: {
      businessId: auth.businessId,
      name,
      order,
    },
    include: { values: { orderBy: [{ order: "asc" }, { value: "asc" }] } },
  });

  return NextResponse.json(created, { status: 201 });
}
