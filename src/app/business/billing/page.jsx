import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import BillingClient from "./BillingClient";

export const metadata = {
    title: "Abonelik ve Ödeme | Civardaki",
    robots: { index: false, follow: false }
};

export default async function BillingPage({ searchParams }) {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "BUSINESS") {
        redirect("/user/login");
    }

    const businessId = session.user.businessId;
    if (!businessId) {
        redirect("/business/onboarding");
    }

    const subscription = await prisma.businesssubscription.findUnique({
        where: { businessId },
        include: { business: true } // Fetch business to get the email
    });

    // Format the dates securely on the server
    const dataToSend = subscription ? {
        id: subscription.id,
        status: subscription.status,
        plan: subscription.plan,
        startedAt: subscription.startedAt.toISOString(),
        expiresAt: subscription.expiresAt.toISOString(),
        email: subscription.business?.email // pass email to client
    } : null;

    return (
        <BillingClient
            subscription={dataToSend}
            isExpiredParams={searchParams?.expired === "true"}
            paymentNotice={searchParams?.payment}
        />
    );
}
