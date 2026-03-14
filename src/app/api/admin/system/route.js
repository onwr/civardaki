import { prisma } from "@/lib/prisma";
import { getUploadsDiskUsage } from "@/lib/system";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Get Cron Heartbeats
        const statuses = await prisma.systemstatus.findMany({
            orderBy: { lastHeartbeat: "desc" }
        });

        // 2. Get Recent Errors
        const recentErrors = await prisma.errorlog.findMany({
            take: 10,
            orderBy: { createdAt: "desc" }
        });

        // 3. Get Disk Usage
        const diskUsage = await getUploadsDiskUsage();

        // 4. Counts for general health
        const activeBusinesses = await prisma.business.count({ where: { isVerified: true } });
        const pendingReviews = await prisma.review.count({ where: { isApproved: false } });

        // 5. Infrastructure oriented aggregates
        const dbNodes = statuses
            .filter((s) => typeof s.key === "string" && (s.key.startsWith("db:") || s.key.startsWith("mysql:")))
            .map((s) => {
                let meta = {};
                if (s.metadata) {
                    try {
                        meta = JSON.parse(s.metadata);
                    } catch {
                        meta = {};
                    }
                }
                const m = meta || {};
                return {
                    key: s.key,
                    name: m.name || s.key,
                    region: m.region || m.zone || "unknown",
                    load: m.load || m.cpuPercent || m.cpu || null,
                    status: s.value || m.status || "UNKNOWN",
                    lastHeartbeat: s.lastHeartbeat
                };
            });

        const coreStatus = statuses.find((s) => s.key === "infra:core") || null;
        let infraMetrics = null;
        if (coreStatus) {
            let meta = {};
            if (coreStatus.metadata) {
                try {
                    meta = JSON.parse(coreStatus.metadata);
                } catch {
                    meta = {};
                }
            }
            const m = meta || {};
            infraMetrics = {
                cpuPercent: typeof m.cpuPercent === "number" ? m.cpuPercent : m.cpu,
                memoryUsageHuman: m.memoryUsageHuman || m.memory || null,
                diskCache: m.diskCache || null,
                networkIn: m.networkIn || null,
                networkOut: m.networkOut || null,
                cdnStatus: m.cdnStatus || null
            };
        }

        return NextResponse.json({
            ok: true,
            heartbeats: statuses,
            errors: recentErrors,
            disk: diskUsage,
            dbNodes,
            infraMetrics,
            logs: recentErrors,
            stats: {
                activeBusinesses,
                pendingReviews
            }
        });

    } catch (error) {
        console.error("System API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
