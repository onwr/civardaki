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

        const assets = await prisma.asset.findMany({
            where: { businessId },
            orderBy: { createdAt: "desc" }
        });

        const stats = {
            totalValue: assets.reduce((sum, a) => sum + a.currentValue, 0),
            activeCount: assets.filter(a => a.status === "ACTIVE").length,
            maintenanceCount: assets.filter(a => a.status === "MAINTENANCE").length,
            depreciation: assets.length > 0
                ? ((1 - assets.reduce((sum, a) => sum + a.currentValue, 0) / assets.reduce((sum, a) => sum + a.purchasePrice, 0)) * 100).toFixed(1)
                : 0,
            listedCount: assets.filter(a => a.isListed).length
        };

        return NextResponse.json({ assets, stats });
    } catch (error) {
        console.error("Assets GET Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.businessId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, category, purchasePrice, currentValue, location, assignedTo, condition } = body;

        const asset = await prisma.asset.create({
            data: {
                id: crypto.randomUUID(),
                businessId: session.user.businessId,
                assetCode: `AST-${category.charAt(0)}-${Math.floor(Math.random() * 1000)}`,
                name,
                category,
                purchasePrice: parseFloat(purchasePrice),
                currentValue: parseFloat(currentValue),
                location,
                assignedTo,
                condition,
                status: "ACTIVE"
            }
        });

        return NextResponse.json(asset);
    } catch (error) {
        console.error("Assets POST Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.businessId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, ...updateData } = body;

        const asset = await prisma.asset.update({
            where: { id, businessId: session.user.businessId },
            data: updateData
        });

        return NextResponse.json(asset);
    } catch (error) {
        console.error("Assets PATCH Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.businessId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        await prisma.asset.delete({
            where: { id, businessId: session.user.businessId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Assets DELETE Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
