import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeLayoutSettings } from "@/lib/proposal-template-utils";

function toStr(v, max = 500) {
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
    layoutSettings: normalizeLayoutSettings(row.layoutSettings),
  };
}

export async function POST(req) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const body = await req.json().catch(() => ({}));
  const sourceId = toStr(body?.sourceId, 191);
  const name = toStr(body?.name, 191);

  if (!sourceId) {
    return NextResponse.json({ message: "Kopyalanacak şablon seçin." }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ message: "Yeni şablon adı zorunludur." }, { status: 400 });
  }

  const source = await prisma.business_proposal_template.findFirst({
    where: { id: sourceId, businessId: auth.businessId },
  });
  if (!source) {
    return NextResponse.json({ message: "Kaynak şablon bulunamadı." }, { status: 404 });
  }

  const last = await prisma.business_proposal_template.findFirst({
    where: { businessId: auth.businessId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const order = (last?.order ?? -1) + 1;

  const layoutSettings = normalizeLayoutSettings(source.layoutSettings);

  try {
    const created = await prisma.business_proposal_template.create({
      data: {
        businessId: auth.businessId,
        name,
        kind: source.kind,
        language: source.language,
        documentTitle: source.documentTitle,
        pageSize: source.pageSize,
        introText: source.introText,
        footerText: source.footerText,
        layoutSettings,
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
