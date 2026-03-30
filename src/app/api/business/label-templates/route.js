import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  LABEL_CATEGORIES,
  LABEL_FORMATS,
  normalizeSettings,
  mergeSettings,
} from "@/lib/label-template-defaults";

function toStr(v, max = 191) {
  return (v ?? "").toString().trim().slice(0, max);
}

async function requireBusiness() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { err: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  if (session.user.role !== "BUSINESS") return { err: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  const businessId = session.user.businessId;
  if (!businessId) return { err: NextResponse.json({ message: "Business not found" }, { status: 404 }) };
  return { businessId };
}

function serialize(row) {
  if (!row) return null;
  return {
    ...row,
    settings: normalizeSettings(row.category, row.settings),
  };
}

export async function GET() {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const items = await prisma.business_label_template.findMany({
    where: { businessId: auth.businessId },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({ items: items.map(serialize) });
}

export async function POST(req) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const body = await req.json().catch(() => ({}));
  let name = toStr(body?.name, 191);
  const category = toStr(body?.category, 32);
  const format = toStr(body?.format, 32);

  if (!LABEL_CATEGORIES.has(category)) {
    return NextResponse.json({ message: "Geçersiz şablon kategorisi." }, { status: 400 });
  }
  if (!LABEL_FORMATS.has(format)) {
    return NextResponse.json({ message: "Geçersiz etiket formatı." }, { status: 400 });
  }

  if (!name) {
    const prefix = category === "ADDRESS" ? "Adres etiketi" : "Ürün etiketi";
    const fmt = format === "RIBBON" ? "Şerit" : "A4";
    name = `${prefix} (${fmt}) ${Date.now()}`;
  }

  const settings = mergeSettings(category, {}, body?.settings ?? {});

  const last = await prisma.business_label_template.findFirst({
    where: { businessId: auth.businessId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const order = Number.isFinite(body?.order) ? Number(body.order) : (last?.order ?? -1) + 1;

  try {
    const created = await prisma.business_label_template.create({
      data: {
        businessId: auth.businessId,
        name,
        category,
        format,
        settings,
        order,
      },
    });
    return NextResponse.json({ item: serialize(created) }, { status: 201 });
  } catch (e) {
    if (e?.code === "P2002") {
      return NextResponse.json({ message: "Bu şablon adı zaten kullanılıyor." }, { status: 409 });
    }
    throw e;
  }
}
