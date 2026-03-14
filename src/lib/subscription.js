import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Ensures the business has an ACTIVE or valid TRIAL subscription.
 * If not, forcefully redirects to the billing page.
 * Call this at the top level of protected server components.
 */
export async function requireValidSubscription() {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "BUSINESS") {
        redirect("/user/login");
    }

    const businessId = session.user.businessId;

    if (!businessId) {
        // Business has not been created yet (shouldn't happen here normally)
        redirect("/business/onboarding");
    }

    // SPRINT 11B: Check if email is verified first. If not, block panel access.
    // Ensure we fetch the latest verification status from DB instead of relying solely on session
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { emailVerified: true }
    });

    if (!user?.emailVerified) {
        redirect("/verify-required");
    }

    const subscription = await prisma.businesssubscription.findUnique({
        where: { businessId }
    });

    if (!subscription) {
        // Edge case: No subscription found at all. Send to billing so they can resolve it.
        redirect("/business/billing");
    }

    const now = new Date();

    // Check if subscription naturally expired
    if (subscription.status !== "EXPIRED" && subscription.expiresAt < now) {
        // Auto-expire it
        await prisma.businesssubscription.update({
            where: { id: subscription.id },
            data: { status: "EXPIRED" }
        });
        redirect("/business/billing?expired=true");
    }

    // Is it currently expired?
    if (subscription.status === "EXPIRED" || subscription.expiresAt < now) {
        redirect("/business/billing");
    }

    return { session, subscription };
}
