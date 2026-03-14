import { prisma } from "@/lib/prisma";
import ApprovalsClient from "./ApprovalsClient";

export default async function AdminApprovalsPage() {
    const reviews = await prisma.review.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            business: {
                select: { id: true, name: true, slug: true }
            },
            user: {
                select: { id: true, name: true, email: true }
            }
        }
    });

    return <ApprovalsClient initialReviews={reviews} />;
}
