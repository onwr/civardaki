import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function toStr(v) { return (v ?? "").toString().trim(); }

async function requireBusiness() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { err: NextResponse.json({ message: "Unauthorized" }, { status: 401 })};
  if (session.user.role !== "BUSINESS") return { err: NextResponse.json({ message: "Forbidden" }, { status: 403 })};
  const businessId = session.user.businessId;
  if (!businessId) return { err: NextResponse.json({ message: "Business not found" }, { status: 404 })};
  return { businessId };
}

/** GET - list warehouses */
export async function GET() {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const list = await prisma.warehouse.findMany({
    where: { businessId: auth.businessId },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(list);
}

/** POST - create warehouse */
export async function POST(req) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const body = await req.json();
  const name = toStr(body?.name);
  const address = toStr(body?.address) || null;
  const capacity = body?.capacity !== undefined && body?.capacity !== null && body?.capacity !== "" ? Math.max(0, parseInt(String(body.capacity), 10)) : null;
  const currentStock = body?.currentStock !== undefined && body?.currentStock !== null && body?.currentStock !== "" ? Math.max(0, parseInt(String(body.currentStock), 10)) : 0;
  const manager = toStr(body?.manager) || null;
  const phone = toStr(body?.phone) || null;

  if (!name || name.length < 2) return NextResponse.json({ message: "Depo adı en az 2 karakter olmalı." }, { status: 400 });

  const wh = await prisma.warehouse.create({
    data: {
      businessId: auth.businessId,
      name,
      address,
      capacity,
      currentStock,
      manager,
      phone,
      isActive: true,
    },
  });

  return NextResponse.json(wh, { status: 201 });
}
