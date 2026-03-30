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

export async function GET(_req, { params }) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const id = toStr(params?.id);
  if (!id) return NextResponse.json({ message: "Geçersiz id." }, { status: 400 });

  const row = await prisma.business_fihrist_entry.findFirst({
    where: { id, businessId: auth.businessId },
    select: entrySelect,
  });

  if (!row) return NextResponse.json({ message: "Kayıt bulunamadı." }, { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(req, { params }) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const id = toStr(params?.id);
  if (!id) return NextResponse.json({ message: "Geçersiz id." }, { status: 400 });

  const existing = await prisma.business_fihrist_entry.findFirst({
    where: { id, businessId: auth.businessId },
    select: { id: true, class1Id: true, class2Id: true },
  });
  if (!existing) return NextResponse.json({ message: "Kayıt bulunamadı." }, { status: 404 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Geçersiz istek gövdesi." }, { status: 400 });
  }

  const name = body?.name !== undefined ? toStr(body.name) : undefined;
  if (name !== undefined && !name) {
    return NextResponse.json({ message: "İsim / unvan boş olamaz." }, { status: 400 });
  }

  const nextC1 =
    body?.class1Id !== undefined ? body.class1Id || null : existing.class1Id;
  const nextC2 =
    body?.class2Id !== undefined ? body.class2Id || null : existing.class2Id;

  const v = await validateFihristClassIds(auth.businessId, nextC1, nextC2);
  if (v.error) return NextResponse.json({ message: v.error }, { status: 400 });

  const data = {};
  if (name !== undefined) data.name = name;
  if (body?.phone1 !== undefined) data.phone1 = toStr(body.phone1) || null;
  if (body?.phone2 !== undefined) data.phone2 = toStr(body.phone2) || null;
  if (body?.email !== undefined) data.email = toStr(body.email) || null;
  if (body?.authorizedPerson !== undefined)
    data.authorizedPerson = toStr(body.authorizedPerson) || null;
  if (body?.address !== undefined) data.address = toStr(body.address) || null;
  if (body?.note !== undefined) data.note = toStr(body.note) || null;
  if (body?.imageUrl !== undefined) data.imageUrl = toStr(body.imageUrl) || null;
  if (body?.class1Id !== undefined) data.class1Id = v.class1Id;
  if (body?.class2Id !== undefined) data.class2Id = v.class2Id;

  if (Object.keys(data).length === 0) {
    const unchanged = await prisma.business_fihrist_entry.findFirst({
      where: { id, businessId: auth.businessId },
      select: entrySelect,
    });
    return NextResponse.json(unchanged);
  }

  const row = await prisma.business_fihrist_entry.update({
    where: { id },
    data,
    select: entrySelect,
  });

  return NextResponse.json(row);
}

export async function DELETE(_req, { params }) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const id = toStr(params?.id);
  if (!id) return NextResponse.json({ message: "Geçersiz id." }, { status: 400 });

  const existing = await prisma.business_fihrist_entry.findFirst({
    where: { id, businessId: auth.businessId },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ message: "Kayıt bulunamadı." }, { status: 404 });

  await prisma.business_fihrist_entry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
