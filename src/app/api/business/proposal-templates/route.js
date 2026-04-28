import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  PROPOSAL_TEMPLATE_KINDS,
  normalizeLayoutSettings,
  defaultDocumentTitleForKind,
} from "@/lib/proposal-template-utils";

function toStr(v, max = 500) {
  return (v ?? "").toString().trim().slice(0, max);
}

async function requireBusiness() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { err: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  if (!["BUSINESS", "ADMIN"].includes(session.user.role)) return { err: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
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

export async function GET() {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const items = await prisma.business_proposal_template.findMany({
    where: { businessId: auth.businessId },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({ items: items.map(serialize) });
}

export async function POST(req) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const body = await req.json().catch(() => ({}));
  const name = toStr(body?.name, 191);
  const kind = toStr(body?.kind, 64);

  if (!name) {
    return NextResponse.json({ message: "Şablon adı zorunludur." }, { status: 400 });
  }
  if (!PROPOSAL_TEMPLATE_KINDS.has(kind)) {
    return NextResponse.json({ message: "Geçersiz şablon türü." }, { status: 400 });
  }

  const language = toStr(body?.language, 16) || "tr";
  const documentTitle = toStr(body?.documentTitle, 191) || defaultDocumentTitleForKind(kind);
  const pageSize = toStr(body?.pageSize, 16) || "A4";
  const introText = body?.introText != null ? String(body.introText).trim().slice(0, 10000) : null;
  const footerText = body?.footerText != null ? String(body.footerText).trim().slice(0, 10000) : null;
  const layoutSettings = normalizeLayoutSettings(body?.layoutSettings);

  const last = await prisma.business_proposal_template.findFirst({
    where: { businessId: auth.businessId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const order = Number.isFinite(body?.order) ? Number(body.order) : (last?.order ?? -1) + 1;

  try {
    const created = await prisma.business_proposal_template.create({
      data: {
        businessId: auth.businessId,
        name,
        kind,
        language,
        documentTitle,
        pageSize,
        introText: introText || null,
        footerText: footerText || null,
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
