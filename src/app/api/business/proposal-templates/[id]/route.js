import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  PROPOSAL_TEMPLATE_KINDS,
  normalizeLayoutSettings,
  mergeLayoutSettings,
} from "@/lib/proposal-template-utils";

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

async function getOwnedOr404(businessId, id) {
  const row = await prisma.business_proposal_template.findFirst({
    where: { id, businessId },
  });
  return row;
}

export async function GET(_req, ctx) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;
  const resolved = typeof ctx.params?.then === "function" ? await ctx.params : ctx.params;
  const id = resolved?.id;
  if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  const row = await getOwnedOr404(auth.businessId, id);
  if (!row) return NextResponse.json({ message: "Şablon bulunamadı." }, { status: 404 });
  return NextResponse.json({ item: serialize(row) });
}

export async function PATCH(req, ctx) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;
  const resolved = typeof ctx.params?.then === "function" ? await ctx.params : ctx.params;
  const id = resolved?.id;
  if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  const existing = await getOwnedOr404(auth.businessId, id);
  if (!existing) return NextResponse.json({ message: "Şablon bulunamadı." }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const data = {};

  if (body.name !== undefined) {
    const name = toStr(body.name, 191);
    if (!name) return NextResponse.json({ message: "Şablon adı boş olamaz." }, { status: 400 });
    data.name = name;
  }
  if (body.kind !== undefined) {
    const kind = toStr(body.kind, 64);
    if (!PROPOSAL_TEMPLATE_KINDS.has(kind)) {
      return NextResponse.json({ message: "Geçersiz şablon türü." }, { status: 400 });
    }
    data.kind = kind;
  }
  if (body.language !== undefined) data.language = toStr(body.language, 16) || "tr";
  if (body.documentTitle !== undefined) data.documentTitle = toStr(body.documentTitle, 191);
  if (body.pageSize !== undefined) data.pageSize = toStr(body.pageSize, 16) || "A4";
  if (body.introText !== undefined) {
    data.introText = body.introText == null ? null : String(body.introText).trim().slice(0, 10000) || null;
  }
  if (body.footerText !== undefined) {
    data.footerText = body.footerText == null ? null : String(body.footerText).trim().slice(0, 10000) || null;
  }
  if (body.order !== undefined && Number.isFinite(Number(body.order))) {
    data.order = Number(body.order);
  }
  if (body.layoutSettings !== undefined) {
    data.layoutSettings = mergeLayoutSettings(existing.layoutSettings, body.layoutSettings);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ item: serialize(existing) });
  }

  try {
    const updated = await prisma.business_proposal_template.update({
      where: { id },
      data,
    });
    return NextResponse.json({ item: serialize(updated) });
  } catch (e) {
    if (e?.code === "P2002") {
      return NextResponse.json({ message: "Bu şablon adı zaten kullanılıyor." }, { status: 409 });
    }
    throw e;
  }
}

export async function DELETE(_req, ctx) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;
  const resolved = typeof ctx.params?.then === "function" ? await ctx.params : ctx.params;
  const id = resolved?.id;
  if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  const res = await prisma.business_proposal_template.deleteMany({
    where: { id, businessId: auth.businessId },
  });
  if (res.count === 0) return NextResponse.json({ message: "Şablon bulunamadı." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
