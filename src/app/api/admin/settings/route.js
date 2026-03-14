import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isValidEmail(value) {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidHexColor(value) {
  if (!value) return false;
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value);
}

function isValidUrl(value) {
  if (!value) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function buildDefaultSettings() {
  return {
    general: {
      platformName: "Civardaki",
      supportEmail: "support@civardaki.com",
      metaDescription:
        "Yakınınızdaki işletmeleri keşfedin, sipariş verin ve hizmet alın. Yerel ekonominin dijital yüzü.",
      defaultLanguage: "tr",
      currency: "TRY",
      timezone: "Europe/Istanbul",
    },
    security: {
      adminTwoFactorRequired: true,
      sessionTimeoutMinutes: 15,
      forceHttps: true,
      loginAttemptLimit: 5,
      passwordMinLength: 8,
    },
    notifications: {
      emailNotificationsEnabled: true,
      adminTicketNotifications: true,
      leadNotifications: true,
      marketingNotifications: false,
    },
    api: {
      publicApiEnabled: false,
      webhookUrl: "",
      webhookSecret: "",
      googleMapsApiKey: "",
      firebaseServerKey: "",
    },
    design: {
      primaryColor: "#004aad",
      secondaryColor: "#0f172a",
      logoUrl: "",
      faviconUrl: "",
      maintenanceMode: false,
    },
  };
}

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return { session: null, errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, errorResponse: null };
}

export async function GET() {
  try {
    const { errorResponse } = await requireAdminSession();
    if (errorResponse) return errorResponse;

    let record = await prisma.platformsetting.findFirst();
    if (!record) {
      const defaults = buildDefaultSettings();
      record = await prisma.platformsetting.create({
        data: {
          general: defaults.general,
          security: defaults.security,
          notifications: defaults.notifications,
          api: defaults.api,
          design: defaults.design,
        },
      });
    }

    return NextResponse.json({
      success: true,
      settings: {
        general: record.general || {},
        security: record.security || {},
        notifications: record.notifications || {},
        api: record.api || {},
        design: record.design || {},
      },
    });
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);
    return NextResponse.json(
      { success: false, error: "Ayarlar yüklenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const { errorResponse } = await requireAdminSession();
    if (errorResponse) return errorResponse;

    const body = await request.json().catch(() => ({}));
    const incoming = body && body.settings ? body.settings : body || {};

    const defaults = buildDefaultSettings();
    let record = await prisma.platformsetting.findFirst();
    if (!record) {
      record = await prisma.platformsetting.create({
        data: {
          general: defaults.general,
          security: defaults.security,
          notifications: defaults.notifications,
          api: defaults.api,
          design: defaults.design,
        },
      });
    }

    const current = {
      general: record.general || defaults.general,
      security: record.security || defaults.security,
      notifications: record.notifications || defaults.notifications,
      api: record.api || defaults.api,
      design: record.design || defaults.design,
    };

    const merged = {
      general: { ...current.general, ...(incoming.general || {}) },
      security: { ...current.security, ...(incoming.security || {}) },
      notifications: { ...current.notifications, ...(incoming.notifications || {}) },
      api: { ...current.api, ...(incoming.api || {}) },
      design: { ...current.design, ...(incoming.design || {}) },
    };

    const errors = [];

    // General validation
    const general = merged.general;
    general.platformName = String(general.platformName || "").trim();
    general.supportEmail = String(general.supportEmail || "").trim();
    general.metaDescription = String(general.metaDescription || "").trim();
    if (general.metaDescription.length > 400) {
      general.metaDescription = general.metaDescription.slice(0, 400);
    }
    general.defaultLanguage = String(general.defaultLanguage || "tr");
    general.currency = String(general.currency || "TRY");
    general.timezone = String(general.timezone || "Europe/Istanbul");

    if (!general.platformName) {
      errors.push("Platform başlığı boş olamaz.");
    }
    if (!isValidEmail(general.supportEmail)) {
      errors.push("Destek e-posta adresi geçerli değil.");
    }
    const allowedLangs = ["tr", "en"];
    if (!allowedLangs.includes(general.defaultLanguage)) {
      errors.push("Varsayılan dil desteklenmiyor.");
    }

    // Security validation
    const security = merged.security;
    security.adminTwoFactorRequired = !!security.adminTwoFactorRequired;
    security.forceHttps = !!security.forceHttps;
    security.sessionTimeoutMinutes = Number(security.sessionTimeoutMinutes || 15);
    security.loginAttemptLimit = Number(security.loginAttemptLimit || 5);
    security.passwordMinLength = Number(security.passwordMinLength || 8);

    if (security.sessionTimeoutMinutes <= 0) {
      errors.push("Oturum zaman aşımı 0'dan büyük olmalıdır.");
    }
    if (security.loginAttemptLimit <= 0) {
      errors.push("Giriş deneme limiti 0'dan büyük olmalıdır.");
    }
    if (security.passwordMinLength < 6) {
      errors.push("Şifre minimum uzunluğu en az 6 olmalıdır.");
    }

    // Notifications validation
    const notifications = merged.notifications;
    notifications.emailNotificationsEnabled = !!notifications.emailNotificationsEnabled;
    notifications.adminTicketNotifications = !!notifications.adminTicketNotifications;
    notifications.leadNotifications = !!notifications.leadNotifications;
    notifications.marketingNotifications = !!notifications.marketingNotifications;

    // API validation
    const api = merged.api;
    api.publicApiEnabled = !!api.publicApiEnabled;
    api.webhookUrl = String(api.webhookUrl || "").trim();
    api.webhookSecret = String(api.webhookSecret || "").trim();
    api.googleMapsApiKey = String(api.googleMapsApiKey || "").trim();
    api.firebaseServerKey = String(api.firebaseServerKey || "").trim();

    if (api.webhookUrl && !isValidUrl(api.webhookUrl)) {
      errors.push("Webhook URL formatı geçerli değil.");
    }

    // Design validation
    const design = merged.design;
    design.primaryColor = String(design.primaryColor || "#004aad").trim();
    design.secondaryColor = String(design.secondaryColor || "#0f172a").trim();
    design.logoUrl = String(design.logoUrl || "").trim();
    design.faviconUrl = String(design.faviconUrl || "").trim();
    design.maintenanceMode = !!design.maintenanceMode;

    if (!isValidHexColor(design.primaryColor)) {
      errors.push("Ana renk kodu geçerli bir HEX renk olmalıdır.");
    }
    if (!isValidHexColor(design.secondaryColor)) {
      errors.push("İkincil renk kodu geçerli bir HEX renk olmalıdır.");
    }
    if (design.logoUrl && !isValidUrl(design.logoUrl)) {
      errors.push("Logo URL formatı geçerli değil.");
    }
    if (design.faviconUrl && !isValidUrl(design.faviconUrl)) {
      errors.push("Favicon URL formatı geçerli değil.");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: errors.join(" "), settings: merged },
        { status: 400 }
      );
    }

    const updated = await prisma.platformsetting.update({
      where: { id: record.id },
      data: {
        general,
        security,
        notifications,
        api,
        design,
      },
    });

    return NextResponse.json({
      success: true,
      settings: {
        general: updated.general,
        security: updated.security,
        notifications: updated.notifications,
        api: updated.api,
        design: updated.design,
      },
    });
  } catch (error) {
    console.error("PATCH /api/admin/settings error:", error);
    return NextResponse.json(
      { success: false, error: "Ayarlar güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

