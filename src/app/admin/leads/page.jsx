import { prisma } from "@/lib/prisma";
import LeadsClient from "./LeadsClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Müşteri Talepleri Yönetimi | Civardaki Admin",
};

export default async function AdminLeadsPage() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        redirect("/api/auth/signin");
    }

    const leads = await prisma.lead.findMany({
        include: {
            business: {
                select: { name: true, slug: true }
            },
            product: {
                select: { name: true }
            }
        },
        orderBy: { createdAt: "desc" },
        take: 100
    });

    return (
        <div className="p-4 lg:p-10">
            <LeadsClient initialLeads={leads} />
        </div>
    );
}
