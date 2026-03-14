import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req, context) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Oturum açmanız gerekiyor.",
                },
                { status: 401 }
            );
        }
        const { id } = await context.params;
        const userId = session.user.id;

        const existing = await prisma.neighborhood_post_like.findFirst({
            where: {
                postId: id,
                userId,
            },
        });

        if (existing) {
            await prisma.neighborhood_post_like.delete({
                where: { id: existing.id },
            });
        } else {
            await prisma.neighborhood_post_like.create({
                data: {
                    postId: id,
                    userId,
                    businessId: null,
                },
            });
        }

        const likeCount = await prisma.neighborhood_post_like.count({
            where: { postId: id },
        });

        await prisma.neighborhood_post.update({
            where: { id },
            data: { likeCount },
        });

        return NextResponse.json({
            success: true,
            liked: !existing,
            likeCount,
        });
    } catch (error) {
        console.error("POST /api/neighborhood/posts/[id]/like error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Beğeni işlemi başarısız.",
            },
            { status: 500 }
        );
    }
}