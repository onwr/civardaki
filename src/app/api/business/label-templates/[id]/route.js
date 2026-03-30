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

async function getOwned(auth, id) {
  return prisma.business_label_template.findFirst({
    where: { id, businessId: auth.businessId },
  });
}

export async function GET(_req, ctx) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;
  const resolved = typeof ctx.params?.then === "function" ? await ctx.params : ctx.params;
  const id = resolved?.id;
  if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  const row = await getOwned(auth, id);
  if (!row) return NextResponse.json({ message: "Şablon bulunamadı." }, { status: 404 });
  return NextResponse.json({ item: serialize(row) });
}

export async function PATCH(req, ctx) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;
  const resolved = typeof ctx.params?.then === "function" ? await ctx.params : ctx.params;
  const id = resolved?.id;
  if (!id) return NextResponse.json({ message: "Bad request" }, { status: 400 });

  const existing = await getOwned(auth, id);
  if (!existing) return NextResponse.json({ message: "Şablon bulunamadı." }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const data = {};

  if (body.name !== undefined) {
    const name = toStr(body.name, 191);
    if (!name) return NextResponse.json({ message: "Şablon adı boş olamaz." }, { status: 400 });
    data.name = name;
  }

  let nextCategory = existing.category;
  if (body.category !== undefined) {
    const category = toStr(body.category, 32);
    if (!LABEL_CATEGORIES.has(category)) {
      return NextResponse.json({ message: "Geçersiz şablon kategorisi." }, { status: 400 });
    }
    data.category = category;
    nextCategory = category;
  }

  if (body.format !== undefined) {
    const format = toStr(body.format, 32);
    if (!LABEL_FORMATS.has(format)) {
      return NextResponse.json({ message: "Geçersiz etiket formatı." }, { status: 400 });
    }
    data.format = format;
  }

  if (body.order !== undefined && Number.isFinite(Number(body.order))) {
    data.order = Number(body.order);
  }

  if (body.settings !== undefined) {
    data.settings = mergeSettings(nextCategory, existing.settings, body.settings);
  } else if (body.category !== undefined && body.category !== existing.category) {
    data.settings = normalizeSettings(nextCategory, existing.settings);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ item: serialize(existing) });
  }

  try {
    const updated = await prisma.business_label_template.update({
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

  const res = await prisma.business_label_template.deleteMany({
    where: { id, businessId: auth.businessId },
  });
  if (res.count === 0) return NextResponse.json({ message: "Şablon bulunamadı." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
