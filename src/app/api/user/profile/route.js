import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function defaultSettings(settings) {
  return {
    language: settings?.language || "tr-TR",
    campaignNotifications: settings?.campaignNotifications ?? true,
    smsOrderNotifications: settings?.smsOrderNotifications ?? true,
    newsletterNotifications: settings?.newsletterNotifications ?? true,
    profileVisibility: settings?.profileVisibility || "PRIVATE",
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 },
      );
    }

    const userId = session.user.id;
    const [user, settings, totalOrders, totalSpentResult, favoriteCount, addressCount] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            createdAt: true,
          },
        }),
        prisma.user_profile_settings.findUnique({
          where: { userId },
        }),
        prisma.order.count({ where: { userId } }),
        prisma.order.aggregate({
          where: { userId, status: "DELIVERED" },
          _sum: { total: true },
        }),
        prisma.user_favorite_business.count({ where: { userId } }),
        prisma.user_address.count({ where: { userId } }),
      ]);

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      user,
      settings: defaultSettings(settings),
      stats: {
        totalOrders,
        totalSpent: Number(totalSpentResult?._sum?.total || 0),
        favoriteCount,
        addressCount,
      },
    });
  } catch (err) {
    console.error("GET /api/user/profile error:", err);
    return NextResponse.json(
      { error: "Profil verisi yüklenemedi." },
      { status: 500 },
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor." },
        { status: 401 },
      );
    }

    const userId = session.user.id;
    const body = await request.json().catch(() => ({}));

    const userData = {};
    if (typeof body.name === "string" && body.name.trim()) {
      userData.name = body.name.trim();
    }
    if (typeof body.phone === "string") {
      userData.phone = body.phone.trim() || null;
    }

    if (Object.keys(userData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: userData,
      });
    }

    const settingsPayload = body?.settings;
    if (settingsPayload && typeof settingsPayload === "object") {
      await prisma.user_profile_settings.upsert({
        where: { userId },
        update: {
          ...(typeof settingsPayload.language === "string"
            ? { language: settingsPayload.language }
            : {}),
          ...(typeof settingsPayload.campaignNotifications === "boolean"
            ? { campaignNotifications: settingsPayload.campaignNotifications }
            : {}),
          ...(typeof settingsPayload.smsOrderNotifications === "boolean"
            ? { smsOrderNotifications: settingsPayload.smsOrderNotifications }
            : {}),
          ...(typeof settingsPayload.newsletterNotifications === "boolean"
            ? { newsletterNotifications: settingsPayload.newsletterNotifications }
            : {}),
          ...(typeof settingsPayload.profileVisibility === "string"
            ? { profileVisibility: settingsPayload.profileVisibility }
            : {}),
        },
        create: {
          userId,
          ...defaultSettings(settingsPayload),
        },
      });
    }

    const { currentPassword, newPassword, confirmPassword } = body || {};
    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        return NextResponse.json(
          { error: "Şifre değişimi için tüm alanlar zorunludur." },
          { status: 400 },
        );
      }
      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { error: "Yeni şifreler eşleşmiyor." },
          { status: 400 },
        );
      }
      if (String(newPassword).length < 8) {
        return NextResponse.json(
          { error: "Yeni şifre en az 8 karakter olmalıdır." },
          { status: 400 },
        );
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      });
      if (!dbUser?.password) {
        return NextResponse.json(
          { error: "Şifre değişimi yapılamadı." },
          { status: 400 },
        );
      }
      const valid = await bcrypt.compare(currentPassword, dbUser.password);
      if (!valid) {
        return NextResponse.json(
          { error: "Mevcut şifre hatalı." },
          { status: 400 },
        );
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashed },
      });
    }

    const [user, settings] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, phone: true, image: true, createdAt: true },
      }),
      prisma.user_profile_settings.findUnique({ where: { userId } }),
    ]);

    return NextResponse.json({
      success: true,
      user,
      settings: defaultSettings(settings),
    });
  } catch (err) {
    console.error("PATCH /api/user/profile error:", err);
    return NextResponse.json(
      { error: "Profil güncellenemedi." },
      { status: 500 },
    );
  }
}
