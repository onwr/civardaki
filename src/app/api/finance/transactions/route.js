import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET(req) {
    try {
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(50, Math.max(10, parseInt(searchParams.get("limit") || "20", 10)));
        const skip = (page - 1) * limit;

        const where = {
            userId: user.id,
            ...(type && type !== "overview" ? { type } : {}),
        };

        const [transactions, total] = await Promise.all([
            prisma.financial_transaction.findMany({
                where,
                orderBy: { date: "desc" },
                skip,
                take: limit,
            }),
            prisma.financial_transaction.count({ where }),
        ]);

        return NextResponse.json({
            transactions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return NextResponse.json(
            { error: "Failed to fetch transactions" },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { type, title, amount, category, date, description, dueDate, totalAmount, creditLimit } =
            await req.json();

        if (!type || !title || !amount) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const transaction = await prisma.financial_transaction.create({
            data: {
                type,
                title,
                amount: parseFloat(amount),
                category: category || "Genel",
                date: new Date(date),
                description,
                dueDate: dueDate ? new Date(dueDate) : null,
                totalAmount: totalAmount ? parseFloat(totalAmount) : null,
                creditLimit: creditLimit ? parseFloat(creditLimit) : null,
                userId: user.id,
                status: "COMPLETED",
            },
        });

        return NextResponse.json(transaction, { status: 201 });
    } catch (error) {
        console.error("Error creating transaction:", error);
        return NextResponse.json(
            { error: "Failed to create transaction" },
            { status: 500 }
        );
    }
}

export async function DELETE(req) {
    try {
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Transaction ID required" }, { status: 400 });
        }

        const transaction = await prisma.financial_transaction.findUnique({
            where: { id },
        });

        if (!transaction || transaction.userId !== user.id) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        await prisma.financial_transaction.delete({ where: { id } });

        return NextResponse.json({ message: "Transaction deleted" });
    } catch (error) {
        console.error("Error deleting transaction:", error);
        return NextResponse.json(
            { error: "Failed to delete transaction" },
            { status: 500 }
        );
    }
}