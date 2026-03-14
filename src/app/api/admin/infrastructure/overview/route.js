import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUploadsDiskUsage } from "@/lib/system";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. DB info (lightweight)
    let db = {
      engine: "MySQL",
      version: null,
      now: null,
      connectionStatus: "UNKNOWN",
    };

    try {
      const versionRows = await prisma.$queryRaw`SELECT VERSION() as version`;
      const nowRows = await prisma.$queryRaw`SELECT NOW() as now`;
      const versionRow = Array.isArray(versionRows) ? versionRows[0] : null;
      const nowRow = Array.isArray(nowRows) ? nowRows[0] : null;

      db = {
        engine: "MySQL",
        version: versionRow?.version || null,
        now: nowRow?.now || null,
        connectionStatus: "OK",
      };
    } catch {
      db.connectionStatus = "ERROR";
    }

    // 2. Business / traffic counters
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalBusinesses,
      activeSubscriptions,
      ordersLast24h,
      revenueLast24hAgg,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.business.count(),
      prisma.businesssubscription.count({ where: { status: "ACTIVE" } }),
      prisma.order.count({
        where: { createdAt: { gte: since } },
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: since } },
        _sum: { total: true },
      }),
    ]);

    const counts = {
      totalUsers,
      totalBusinesses,
      activeSubscriptions,
      ordersLast24h,
      revenueLast24h: revenueLast24hAgg?._sum?.total || 0,
    };

    // 3. Storage usage
    const storageRaw = await getUploadsDiskUsage();
    const storage = {
      ...storageRaw,
    };
    if (storage.sizeBytes && !storage.usagePercent) {
      const capacityBytes = 10 * 1024 * 1024 * 1024; // varsayılan 10GB
      storage.usagePercent = Math.min(
        100,
        Math.round((storage.sizeBytes / capacityBytes) * 100)
      );
    }

    // 4. System logs / heartbeats
    const [heartbeats, errors] = await Promise.all([
      prisma.systemstatus.findMany({
        orderBy: { lastHeartbeat: "desc" },
        take: 10,
      }),
      prisma.errorlog.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    const system = {
      heartbeats,
      errors,
    };

    return NextResponse.json({
      ok: true,
      db,
      counts,
      storage,
      system,
    });
  } catch (error) {
    console.error("Infrastructure overview API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

