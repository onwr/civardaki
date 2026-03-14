import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return { session: null, errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, errorResponse: null };
}

function deriveSecurityLevel(security) {
  if (!security) return "MEDIUM";

  const twoFactor = !!security.adminTwoFactorRequired;
  const forceHttps = !!security.forceHttps;
  const timeout = Number(security.sessionTimeoutMinutes || 0);
  const loginLimit = Number(security.loginAttemptLimit || 0);

  if (twoFactor && forceHttps && timeout > 0 && loginLimit > 0) {
    return "HIGH";
  }

  if (forceHttps) {
    return "MEDIUM";
  }

  return "LOW";
}

export async function GET() {
  try {
    const { errorResponse } = await requireAdminSession();
    if (errorResponse) return errorResponse;

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [activeSessionsCountRaw, settingsRecord, recentErrorLogs] = await Promise.all([
      prisma.session.count({
        where: {
          expires: {
            gt: now,
          },
        },
      }),
      prisma.platformsetting.findFirst(),
      prisma.errorlog.findMany({
        where: {
          createdAt: {
            gt: oneDayAgo,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      }),
    ]);

    let activeSessionsCount = activeSessionsCountRaw;
    const oneDayAgoForUsers = oneDayAgo;

    // Eğer veritabanı tabanlı session kullanılmıyorsa, son 24 saatte giriş yapmış kullanıcı sayısını fallback olarak kullan
    if (!activeSessionsCount) {
      activeSessionsCount = await prisma.user.count({
        where: {
          lastLoginAt: {
            gt: oneDayAgoForUsers,
          },
        },
      });
    }

    const security = settingsRecord?.security || {};

    const summary = {
      activeSessionsCount,
      blockedThreatsLast24h: recentErrorLogs.length,
      sslEnabled: !!security.forceHttps,
      overallSecurityLevel: deriveSecurityLevel(security),
    };

    const protocols = [
      {
        key: "adminTwoFactorRequired",
        title: "İki Faktörlü Doğrulama (Admin)",
        description: "Tüm yönetici paneli girişlerinde ek doğrulama katmanı gerektirir.",
        enabled: !!security.adminTwoFactorRequired,
      },
      {
        key: "forceHttps",
        title: "SSL Zorunlu (HTTPS)",
        description: "Tüm platform trafiğini HTTPS üzerinden yönlendirir.",
        enabled: !!security.forceHttps,
      },
      {
        key: "sessionTimeoutMinutes",
        title: "Oturum Zaman Aşımı",
        description: "Belirli bir süre hareketsizlikten sonra oturumu otomatik sonlandırır.",
        enabled: Number(security.sessionTimeoutMinutes || 0) > 0,
      },
      {
        key: "loginAttemptLimit",
        title: "Brute-Force Koruması",
        description: "Belirli sayıda hatalı girişten sonra ek güvenlik önlemleri uygular.",
        enabled: Number(security.loginAttemptLimit || 0) > 0,
      },
    ];

    const accessLogs = recentErrorLogs.map((log) => {
      let meta = {};
      try {
        if (log.metadata) {
          meta = JSON.parse(log.metadata);
        }
      } catch {
        meta = {};
      }

      return {
        id: log.id,
        eventType: meta.eventType || log.service || "SYSTEM_ERROR",
        userName: meta.userName || meta.user || "Bilinmiyor",
        createdAt: log.createdAt,
        ip: meta.ip || meta.ipAddress || "-",
        status: meta.status || (log.level || "ERROR"),
      };
    });

    return NextResponse.json({
      success: true,
      summary,
      protocols,
      accessLogs,
    });
  } catch (error) {
    console.error("GET /api/admin/security/overview error:", error);
    return NextResponse.json(
      { success: false, error: "Güvenlik verileri yüklenirken bir hata oluştu." },
      { status: 500 },
    );
  }
}

