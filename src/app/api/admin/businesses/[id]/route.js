import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function ensureAdmin(session) {
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Yetkisiz." }, { status: 401 });
  }
  return null;
}

function normalizeBusiness(b) {
  if (!b) return null;
  const { businesssubscription, ownedbusiness, _count, ...rest } = b;
  return {
    ...rest,
    subscription: businesssubscription
      ? {
          id: businesssubscription.id,
          status: businesssubscription.status,
          plan: businesssubscription.plan,
          startedAt: businesssubscription.startedAt,
          expiresAt: businesssubscription.expiresAt,
          createdAt: businesssubscription.createdAt,
          updatedAt: businesssubscription.updatedAt,
        }
      : null,
    owner: ownedbusiness?.[0]?.user ?? null,
    primaryCategory: b.primaryCategory ?? null,
    _count: _count
      ? {
          leads: _count.lead,
          reviews: _count.review,
          products: _count.product,
          orders: _count.order,
        }
      : { leads: 0, reviews: 0, products: 0, orders: 0 },
  };
}

const DETAIL_INCLUDE = {
  businesssubscription: true,
  primaryCategory: true,
  media: {
    where: { type: "LOGO" },
    select: { url: true },
    take: 1,
  },
  _count: { select: { lead: true, review: true, product: true, order: true } },
  ownedbusiness: {
    where: { isPrimary: true },
    take: 1,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          status: true,
          role: true,
        },
      },
    },
  },
};

export async function GET(request, context) {
  try {
    const session = await getServerSession(authOptions);
    const err = await ensureAdmin(session);
    if (err) return err;

    const params = typeof context.params?.then === "function" ? await context.params : context.params || {};
    const id = params.id;
    if (!id) return NextResponse.json({ success: false, error: "ID gerekli." }, { status: 400 });

    const business = await prisma.business.findUnique({
      where: { id },
      include: DETAIL_INCLUDE,
    });

    if (!business) return NextResponse.json({ success: false, error: "İşletme bulunamadı." }, { status: 404 });

    return NextResponse.json({ success: true, business: normalizeBusiness(business) });
  } catch (e) {
    console.error("Admin business GET error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}

const ALLOWED_BUSINESS_FIELDS = [
  "name",
  "slug",
  "description",
  "phone",
  "email",
  "website",
  "address",
  "city",
  "district",
  "latitude",
  "longitude",
  "workingHours",
  "isActive",
  "isVerified",
  "isOpen",
  "reservationEnabled",
  "primaryCategoryId",
];

export async function PATCH(request, context) {
  try {
    const session = await getServerSession(authOptions);
    const err = await ensureAdmin(session);
    if (err) return err;

    const params = typeof context.params?.then === "function" ? await context.params : context.params || {};
    const id = params.id;
    if (!id) return NextResponse.json({ success: false, error: "ID gerekli." }, { status: 400 });

    const body = await request.json().catch(() => ({}));
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Geçersiz istek." }, { status: 400 });
    }

    const existing = await prisma.business.findUnique({
      where: { id },
      include: {
        businesssubscription: true,
        ownedbusiness: {
          where: { isPrimary: true },
          take: 1,
          select: { userId: true },
        },
      },
    });
    if (!existing) return NextResponse.json({ success: false, error: "İşletme bulunamadı." }, { status: 404 });

    const data = {};
    const ownerUserId = existing.ownedbusiness?.[0]?.userId || null;

    if (body.action === "toggle") {
      data.isActive = !existing.isActive;
    } else if (body.action === "verify") {
      data.isVerified = true;
    } else if (body.action === "unverify") {
      data.isVerified = false;
    } else if (body.action === "verifyOwnerEmail" || body.action === "unverifyOwnerEmail") {
      if (!ownerUserId) {
        return NextResponse.json({ success: false, error: "Bu işletme için birincil sahip bulunamadı." }, { status: 400 });
      }
      await prisma.user.update({
        where: { id: ownerUserId },
        data: { emailVerified: body.action === "verifyOwnerEmail" ? new Date() : null },
      });
    } else if (body.action === "setOwnerStatus") {
      if (!ownerUserId) {
        return NextResponse.json({ success: false, error: "Bu işletme için birincil sahip bulunamadı." }, { status: 400 });
      }
      const nextStatus = String(body.status || "").toUpperCase();
      if (!["ACTIVE", "SUSPENDED", "BANNED", "PENDING"].includes(nextStatus)) {
        return NextResponse.json({ success: false, error: "Geçersiz sahip durumu." }, { status: 400 });
      }
      if (ownerUserId === session.user.id && nextStatus !== "ACTIVE") {
        return NextResponse.json({ success: false, error: "Kendi hesabınızı pasif/suspended yapamazsınız." }, { status: 400 });
      }
      await prisma.user.update({
        where: { id: ownerUserId },
        data: { status: nextStatus },
      });
    } else if (body.action === "setOwnerRole") {
      if (!ownerUserId) {
        return NextResponse.json({ success: false, error: "Bu işletme için birincil sahip bulunamadı." }, { status: 400 });
      }
      const nextRole = String(body.role || "").toUpperCase();
      if (!["USER", "BUSINESS", "ADMIN"].includes(nextRole)) {
        return NextResponse.json({ success: false, error: "Geçersiz sahip rolü." }, { status: 400 });
      }
      if (ownerUserId === session.user.id && nextRole !== "ADMIN") {
        return NextResponse.json({ success: false, error: "Kendi admin yetkinizi kaldıramazsınız." }, { status: 400 });
      }
      await prisma.user.update({
        where: { id: ownerUserId },
        data: { role: nextRole },
      });
    } else {
      for (const key of ALLOWED_BUSINESS_FIELDS) {
        if (body[key] !== undefined) {
          if (key === "slug" && typeof body[key] === "string") {
            const slug = body[key].trim();
            if (slug) data.slug = slug;
          } else if (key === "latitude" || key === "longitude") {
            const v = body[key];
            if (v === null || v === undefined) data[key] = null;
            else {
              const n = Number(v);
              if (!Number.isNaN(n)) data[key] = n;
            }
          } else if (
            key === "isActive" ||
            key === "isVerified" ||
            key === "isOpen" ||
            key === "reservationEnabled"
          ) {
            data[key] = Boolean(body[key]);
          } else if (key === "primaryCategoryId") {
            data[key] = body[key] === "" || body[key] == null ? null : String(body[key]);
          } else if (typeof body[key] === "string" || body[key] === null) {
            data[key] = body[key];
          }
        }
      }
    }

    if (body.subscription && typeof body.subscription === "object") {
      const sub = body.subscription;
      const plan = sub.plan && ["BASIC", "PREMIUM"].includes(sub.plan) ? sub.plan : undefined;
      const status = sub.status && ["TRIAL", "ACTIVE", "EXPIRED"].includes(sub.status) ? sub.status : undefined;
      const expiresAt = sub.expiresAt ? new Date(sub.expiresAt) : null;
      const startedAt = sub.startedAt ? new Date(sub.startedAt) : null;

      if (existing.businesssubscription) {
        const subData = {};
        if (plan) subData.plan = plan;
        if (status) subData.status = status;
        if (expiresAt && !Number.isNaN(expiresAt.getTime())) subData.expiresAt = expiresAt;
        if (startedAt && !Number.isNaN(startedAt.getTime())) subData.startedAt = startedAt;
        if (Object.keys(subData).length > 0) {
          await prisma.businesssubscription.update({
            where: { id: existing.businesssubscription.id },
            data: subData,
          });
        }
      } else {
        const now = new Date();
        await prisma.businesssubscription.create({
          data: {
            businessId: id,
            plan: plan || "BASIC",
            status: status || "TRIAL",
            startedAt: startedAt && !Number.isNaN(startedAt.getTime()) ? startedAt : now,
            expiresAt: expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          },
        });
      }
    }

    let business = existing;
    if (Object.keys(data).length > 0) {
      business = await prisma.business.update({
        where: { id },
        data,
        include: DETAIL_INCLUDE,
      });
    } else {
      business = await prisma.business.findUnique({
        where: { id },
        include: DETAIL_INCLUDE,
      });
    }

    return NextResponse.json({ success: true, business: normalizeBusiness(business) });
  } catch (e) {
    console.error("Admin business PATCH error:", e);
    if (e.code === "P2002") return NextResponse.json({ success: false, error: "Bu slug zaten kullanılıyor." }, { status: 400 });
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const session = await getServerSession(authOptions);
    const err = await ensureAdmin(session);
    if (err) return err;

    const params = typeof context.params?.then === "function" ? await context.params : context.params || {};
    const id = params.id;
    if (!id) return NextResponse.json({ success: false, error: "ID gerekli." }, { status: 400 });

    await prisma.business.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Admin business DELETE error:", e);
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
