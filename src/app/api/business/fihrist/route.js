import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateFihristClassIds } from "@/lib/fihrist-validate";

async function requireBusiness() {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return { err: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  if (session.user.role !== "BUSINESS")
    return { err: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  const businessId = session.user.businessId;
  if (!businessId)
    return { err: NextResponse.json({ message: "Business not found" }, { status: 404 }) };
  return { businessId };
}

function toStr(v) {
  return (v ?? "").toString().trim();
}

const entrySelect = {
  id: true,
  name: true,
  phone1: true,
  phone2: true,
  email: true,
  authorizedPerson: true,
  address: true,
  note: true,
  imageUrl: true,
  class1Id: true,
  class2Id: true,
  createdAt: true,
  updatedAt: true,
  class1: { select: { id: true, name: true } },
  class2: { select: { id: true, name: true } },
};

/** GET ?q=&classSlot=1|2&classEntryId= */
export async function GET(req) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const { searchParams } = new URL(req.url);
  const q = toStr(searchParams.get("q"));
  const classSlot = toStr(searchParams.get("classSlot"));
  const classEntryId = toStr(searchParams.get("classEntryId"));

  const where = { businessId: auth.businessId };

  if (classSlot === "1" && classEntryId) {
    where.class1Id = classEntryId;
  } else if (classSlot === "2" && classEntryId) {
    where.class2Id = classEntryId;
  }

  if (q.length >= 2) {
    where.AND = where.AND || [];
    where.AND.push({
      OR: [
        { name: { contains: q } },
        { email: { contains: q } },
        { phone1: { contains: q } },
        { phone2: { contains: q } },
        { authorizedPerson: { contains: q } },
      ],
    });
  }

  const entries = await prisma.business_fihrist_entry.findMany({
    where,
    orderBy: [{ name: "asc" }, { createdAt: "desc" }],
    take: 2000,
    select: entrySelect,
  });

  return NextResponse.json({ entries });
}

export async function POST(req) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Geçersiz istek gövdesi." }, { status: 400 });
  }

  const name = toStr(body?.name);
  if (!name) {
    return NextResponse.json({ message: "İsim / unvan zorunludur." }, { status: 400 });
  }

  const v = await validateFihristClassIds(
    auth.businessId,
    body?.class1Id || null,
    body?.class2Id || null,
  );
  if (v.error) return NextResponse.json({ message: v.error }, { status: 400 });

  const row = await prisma.business_fihrist_entry.create({
    data: {
      businessId: auth.businessId,
      name,
      phone1: toStr(body?.phone1) || null,
      phone2: toStr(body?.phone2) || null,
      email: toStr(body?.email) || null,
      authorizedPerson: toStr(body?.authorizedPerson) || null,
      address: toStr(body?.address) || null,
      note: toStr(body?.note) || null,
      imageUrl: toStr(body?.imageUrl) || null,
      class1Id: v.class1Id,
      class2Id: v.class2Id,
    },
    select: entrySelect,
  });

  return NextResponse.json(row, { status: 201 });
}
