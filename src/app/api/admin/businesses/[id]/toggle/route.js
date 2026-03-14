import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req, context) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const params = typeof context.params?.then === "function" ? await context.params : context.params || {};
        const { id } = params;
        const body = await req.json();
        const { isActive } = body;

        if (typeof isActive !== "boolean") {
            return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
        }

        const business = await prisma.business.update({
            where: { id },
            data: { isActive }
        });

        return NextResponse.json({ status: "success", business });

    } catch (error) {
        console.error("Admin Toggle Business Error:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
