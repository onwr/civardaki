import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req, context) {
    try {
        const { id } = await context.params;

        const post = await prisma.neighborhood_post.findUnique({
            where: { id },
            include: {
                images: { orderBy: { sortOrder: "asc" } },
                attributes: { orderBy: { sortOrder: "asc" } },
                comments: {
                    orderBy: { createdAt: "desc" },
                    include: {
                        user: {
                            select: { id: true, name: true, image: true },
                        },
                        business: {
                            select: { id: true, name: true, isVerified: true },
                        },
                    },
                },
                authorUser: {
                    select: { id: true, name: true, image: true },
                },
                authorBusiness: {
                    select: { id: true, name: true, isVerified: true },
                },
            },
        });

        if (!post) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Gönderi bulunamadı.",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            item: post,
        });
    } catch (error) {
        console.error("GET /api/neighborhood/posts/[id] error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Gönderi detayı alınamadı.",
            },
            { status: 500 }
        );
    }
}