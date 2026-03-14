import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from 'crypto';

export async function POST(req) {
    try {
        const body = await req.json();
        const { businessSlug, type, productId } = body;

        if (!businessSlug || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Fire-and-forget logic: We don't want to block the client on slow DB inserts for telemetry
        // But in serverless/Edge contexts floating promises might be killed.
        // For Next.js App Router Node.js runtime, we can await it quickly or use waitUntil 
        // if using Vercel. For a standard VPS, standard await is fine since DB is local.

        // Resolve Business ID from slug quickly
        const business = await prisma.business.findUnique({
            where: { slug: businessSlug },
            select: { id: true }
        });

        if (!business) {
            return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
        }

        // SPRINT 9G: Event Abuse Guard (Throttle)
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
        const userAgent = req.headers.get('user-agent') || 'unknown';

        // 1. IP Hash for persistence
        const ipHash = crypto.createHash('sha256').update(ip + process.env.NEXTAUTH_SECRET).digest('hex');

        // 2. Event Bucket: VIEW_PROFILE = 1 min (so repeated visits count), others = 10 min
        const bucketMs = type === "VIEW_PROFILE" ? 1 * 60 * 1000 : 10 * 60 * 1000;
        const bucket = Math.floor(Date.now() / bucketMs);
        const throttleKey = crypto.createHash('sha256').update(`${ipHash}|${business.id}|${type}|${bucket}`).digest('hex');

        // 3. Throttle Check
        try {
            await prisma.eventthrottle.create({
                data: {
                    key: throttleKey,
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 min expiration
                }
            });
        } catch (throttleError) {
            // If unique constraint fails (P2002), we skip the event counting (status 204 No Content for telemetry skip)
            if (throttleError.code === 'P2002') {
                return new NextResponse(null, { status: 204 });
            }
            throw throttleError; // Re-throw generic DB errors
        }

        // 4. Record the Event (Passed Throttle)
        await prisma.businessevent.create({
            data: {
                businessId: business.id,
                type: type, // VIEW_PROFILE, VIEW_PRODUCT, CLICK_PHONE, CLICK_WHATSAPP
                productId: productId || null,
                ipHash: ipHash,
                userAgent: userAgent.substring(0, 255)
            }
        });

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        // Silently fail telemetry errors to not break client
        console.error("TELEMETRY ERROR:", error);
        return NextResponse.json({ success: false }, { status: 200 });
    }
}
