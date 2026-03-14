import { prisma } from "./prisma";

/**
 * Utility to log pulse/heartbeat for system services (workers, etc.)
 */
export async function logPulse(key, value = "OK", metadata = {}) {
    try {
        await prisma.systemStatus.upsert({
            where: { key },
            update: {
                value,
                lastHeartbeat: new Date(),
                metadata
            },
            create: {
                key,
                value,
                metadata
            }
        });
    } catch (e) {
        console.error(`Failed to log pulse for ${key}:`, e);
    }
}

/**
 * Global error logging utility for use across API, workers, and sockets.
 */
export async function logError(service, message, error = null, metadata = {}) {
    try {
        await prisma.errorLog.create({
            data: {
                service,
                message,
                stack: error?.stack || null,
                metadata: {
                    ...metadata,
                    timestamp: new Date().toISOString()
                }
            }
        });

        // In production, you'd also send to Sentry/Slack here
        console.error(`[SYSTEM ERROR][${service}] ${message}`, error);
    } catch (e) {
        console.error("Critical: Failed to save error log in DB:", e);
    }
}

/**
 * Utility to get disk usage of the uploads directory.
 */
import fs from "fs";
import path from "path";

export async function getUploadsDiskUsage() {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    try {
        if (!fs.existsSync(uploadsDir)) return { size: 0, count: 0 };

        let totalSize = 0;
        let fileCount = 0;

        function getFiles(dir) {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const name = path.join(dir, file);
                const stats = fs.statSync(name);
                if (stats.isDirectory()) {
                    getFiles(name);
                } else {
                    totalSize += stats.size;
                    fileCount++;
                }
            }
        }

        getFiles(uploadsDir);

        return {
            sizeBytes: totalSize,
            sizeHuman: (totalSize / (1024 * 1024)).toFixed(2) + " MB",
            fileCount
        };
    } catch (e) {
        console.error("Failed to calculate disk usage:", e);
        return { error: e.message };
    }
}
