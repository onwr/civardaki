import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req, context) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const params = typeof context.params?.then === "function" ? await context.params : context.params || {};
        const { id } = params;

        await prisma.review.delete({
            where: { id }
        });

        return NextResponse.json({ status: "success", message: "Review deleted" });

    } catch (error) {
        console.error("Admin Delete Review Error:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
