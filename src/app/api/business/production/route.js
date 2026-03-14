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

/** GET - list production runs */
export async function GET() {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const runs = await prisma.production_run.findMany({
    where: { businessId: auth.businessId },
    include: { product: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const items = runs.map((r) => ({
    id: r.id,
    productId: r.productId,
    productName: r.product.name,
    quantity: r.quantity,
    unit: r.unit,
    recipe: r.recipe,
    startDate: r.startDate,
    endDate: r.endDate,
    status: r.status,
    cost: r.cost,
    createdAt: r.createdAt,
  }));

  return NextResponse.json(items);
}

/** POST - create production run */
export async function POST(req) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const body = await req.json();
  const productId = toStr(body?.productId);
  const quantity = Math.max(0, Number(body?.quantity) || 0);
  const unit = toStr(body?.unit) || "kg";
  const recipe = toStr(body?.recipe) || null;
  const startDate = body?.startDate ? new Date(body.startDate) : new Date();
  const endDate = body?.endDate ? new Date(body.endDate) : new Date();
  const cost = Math.max(0, Number(body?.cost) || 0);

  if (!productId) return NextResponse.json({ message: "Ürün seçin." }, { status: 400 });

  const product = await prisma.product.findFirst({
    where: { id: productId, businessId: auth.businessId },
    select: { id: true, name: true },
  });
  if (!product) return NextResponse.json({ message: "Ürün bulunamadı." }, { status: 404 });

  const run = await prisma.production_run.create({
    data: {
      businessId: auth.businessId,
      productId,
      quantity,
      unit,
      recipe,
      startDate,
      endDate,
      cost,
      status: "IN_PROGRESS",
    },
    include: { product: { select: { name: true } } },
  });

  return NextResponse.json(
    {
      id: run.id,
      productId: run.productId,
      productName: run.product.name,
      quantity: run.quantity,
      unit: run.unit,
      recipe: run.recipe,
      startDate: run.startDate,
      endDate: run.endDate,
      status: run.status,
      cost: run.cost,
      createdAt: run.createdAt,
    },
    { status: 201 }
  );
}
