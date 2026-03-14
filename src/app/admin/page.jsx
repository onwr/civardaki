import { prisma } from "@/lib/prisma";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboardPage() {
    // 1. Fetch Global Metrics
    const [
        totalUsers,
        totalBusinesses,
        totalLeads,
        totalReferrals,
        activeSubscriptions
    ] = await Promise.all([
        prisma.user.count({ where: { role: "USER" } }),
        prisma.business.count(),
        prisma.lead.count(),
        prisma.referral.count(),
        prisma.businesssubscription.count({
            where: { status: "ACTIVE" }
        })
    ]);

    // Calculate MRR (Monthly Recurring Revenue Estimations)
    // Assuming 299 TL per active subscription currently.
    const estimatedMRR = activeSubscriptions * 299;

    // 2. Fetch Recent Registrations (Last 5)
    const recentBusinesses = await prisma.business.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            category: true,
            createdAt: true,
            isActive: true,
            businesssubscription: {
                select: { status: true }
            }
        }
    });

    const metrics = {
        totalUsers,
        totalBusinesses,
        totalLeads,
        totalReferrals,
        estimatedMRR,
        activeSubscriptions
    };

    const recentWithSubscription = recentBusinesses.map((b) => ({
        ...b,
        subscription: b.businesssubscription || null,
    }));

    return <AdminDashboardClient metrics={metrics} recentBusinesses={recentWithSubscription} />;
}
