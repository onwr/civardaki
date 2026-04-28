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

const KINDS = new Set([
  "PRODUCT_BRAND",
  "CUSTOMER_CLASS_1",
  "CUSTOMER_CLASS_2",
  "SUPPLIER_CLASS_1",
  "SUPPLIER_CLASS_2",
  "FIHRIST_1",
  "FIHRIST_2",
  "SHELF_LOCATION",
]);

/** GET — kind bazında gruplanmış kayıtlar */
export async function GET() {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const rows = await prisma.business_masterdata_entry.findMany({
    where: { businessId: auth.businessId },
    orderBy: [{ kind: "asc" }, { order: "asc" }, { name: "asc" }],
    select: { id: true, kind: true, name: true, order: true, createdAt: true, updatedAt: true },
  });

  const byKind = {};
  for (const k of KINDS) byKind[k] = [];
  for (const row of rows) {
    if (!byKind[row.kind]) byKind[row.kind] = [];
    byKind[row.kind].push(row);
  }

  return NextResponse.json({ byKind });
}

/** POST — { kind, name } */
export async function POST(req) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const body = await req.json();
  const kind = toStr(body?.kind);
  const name = toStr(body?.name);

  if (!KINDS.has(kind)) {
    return NextResponse.json({ message: "Geçersiz tanım türü." }, { status: 400 });
  }
  if (!name || name.length < 1) {
    return NextResponse.json({ message: "Tanım adı zorunludur." }, { status: 400 });
  }

  const last = await prisma.business_masterdata_entry.findFirst({
    where: { businessId: auth.businessId, kind },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const order = Number.isFinite(body?.order) ? Number(body.order) : (last?.order ?? -1) + 1;

  try {
    const created = await prisma.business_masterdata_entry.create({
      data: {
        businessId: auth.businessId,
        kind,
        name,
        order,
      },
      select: { id: true, kind: true, name: true, order: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    if (e?.code === "P2002") {
      return NextResponse.json({ message: "Bu tanım bu grupta zaten kayıtlı." }, { status: 409 });
    }
    throw e;
  }
}
