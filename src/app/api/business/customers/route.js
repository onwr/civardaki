import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.businessId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const businessId = session.user.businessId;

        // Fetch all related data
        const [orders, leads, reviews] = await Promise.all([
            prisma.order.findMany({ where: { businessId } }),
            prisma.lead.findMany({ where: { businessId } }),
            prisma.review.findMany({ where: { businessId } })
        ]);

        // Merge logic: Group by Email (primary) or Phone
        const customersMap = new Map();

        const getCustomerKey = (email, phone) => email?.toLowerCase() || phone || "anonymous";

        // Process Orders
        orders.forEach(order => {
            const key = getCustomerKey(null, null); // Orders currently don't have email in schema, using name or orderId is tricky
            // Since order schema only has customerName, we'll use name as temporary key if email/phone missing
            const nameKey = order.customerName || "Bilinmeyen Müşteri";

            if (!customersMap.has(nameKey)) {
                customersMap.set(nameKey, {
                    id: order.id,
                    name: nameKey,
                    email: "-",
                    phone: "-",
                    totalOrders: 0,
                    totalSpent: 0,
                    loyaltyPoints: 0,
                    satisfaction: 0,
                    reviewCount: 0,
                    category: "Regular",
                    customerCode: `CUST-${order.id.substring(0, 4).toUpperCase()}`,
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(nameKey)}&background=random`,
                    lastActivity: order.createdAt
                });
            }

            const c = customersMap.get(nameKey);
            c.totalOrders += 1;
            c.totalSpent += order.total;
            c.loyaltyPoints += Math.floor(order.total / 10);
            if (order.createdAt > c.lastActivity) c.lastActivity = order.createdAt;
        });

        // Process Leads (Potential customers)
        leads.forEach(lead => {
            const key = lead.email || lead.name;
            if (!customersMap.has(key)) {
                customersMap.set(key, {
                    id: lead.id,
                    name: lead.name,
                    email: lead.email || "-",
                    phone: lead.phone || "-",
                    totalOrders: 0,
                    totalSpent: 0,
                    loyaltyPoints: 0,
                    satisfaction: 0,
                    reviewCount: 0,
                    category: "New",
                    customerCode: `LEAD-${lead.id.substring(0, 4).toUpperCase()}`,
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(lead.name)}&background=random`,
                    lastActivity: lead.createdAt
                });
            } else {
                const c = customersMap.get(key);
                if (lead.email) c.email = lead.email;
                if (lead.phone) c.phone = lead.phone;
                if (lead.createdAt > c.lastActivity) c.lastActivity = lead.createdAt;
            }
        });

        // Process Reviews
        reviews.forEach(review => {
            const key = review.reviewerEmail || review.reviewerName;
            if (customersMap.has(key)) {
                const c = customersMap.get(key);
                c.satisfaction = ((c.satisfaction * c.reviewCount) + review.rating) / (c.reviewCount + 1);
                c.reviewCount += 1;
            }
        });

        const customersList = Array.from(customersMap.values()).map(c => {
            // Logic for categorization
            if (c.totalSpent > 5000 || c.totalOrders > 20) c.category = "VIP";
            else if (c.totalOrders === 0) c.category = "New";
            else c.category = "Regular";

            c.satisfaction = c.satisfaction > 0 ? c.satisfaction.toFixed(1) : "5.0";

            // Churn risk logic: if last activity > 30 days
            const daysSinceLastActivity = (new Date() - new Date(c.lastActivity)) / (1000 * 60 * 60 * 24);
            c.churnRisk = daysSinceLastActivity > 30 ? "high" : daysSinceLastActivity > 15 ? "medium" : "low";

            return c;
        });

        // Stats
        const stats = {
            total: customersList.length,
            active: customersList.filter(c => c.churnRisk !== "high").length,
            vip: customersList.filter(c => c.category === "VIP").length,
            newThisMonth: customersList.filter(c => {
                const firstActivity = new Date(c.lastActivity);
                const startOfMonth = new Date();
                startOfMonth.setDate(1);
                return firstActivity >= startOfMonth;
            }).length,
            totalRevenue: customersList.reduce((sum, c) => sum + c.totalSpent, 0),
            avgSatisfaction: customersList.length > 0
                ? (customersList.reduce((sum, c) => sum + parseFloat(c.satisfaction), 0) / customersList.length).toFixed(1)
                : "5.0"
        };

        return NextResponse.json({ customers: customersList, stats });
    } catch (error) {
        console.error("Customers GET Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
