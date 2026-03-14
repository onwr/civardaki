import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth, subDays, startOfDay, format } from "date-fns";
const DAY_NAMES = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.businessId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const businessId = session.user.businessId;
        const { searchParams } = new URL(req.url || "", "http://localhost");
        const filterType = searchParams.get("type"); // INCOME | EXPENSE | TRANSFER
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

        // 1. Get all accounts
        let accounts = await prisma.cash_account.findMany({
            where: { businessId },
            orderBy: { createdAt: "asc" }
        });

        // AUTO-SEED: If no accounts exist, create default ones for Elite experience
        if (accounts.length === 0) {
            const defaultAccounts = [
                { id: crypto.randomUUID(), businessId, name: "Ana Kasa", type: "CASH", balance: 0 },
                { id: crypto.randomUUID(), businessId, name: "Banka Hesabı", type: "BANK", balance: 0 }
            ];

            await prisma.cash_account.createMany({
                data: defaultAccounts
            });

            accounts = await prisma.cash_account.findMany({
                where: { businessId },
                orderBy: { createdAt: "asc" }
            });
        }

        // 2. Get transactions (optional filter by type)
        const transactionWhere = { businessId };
        if (filterType && ["INCOME", "EXPENSE", "TRANSFER"].includes(filterType)) {
            transactionWhere.type = filterType;
        }
        const transactions = await prisma.cash_transaction.findMany({
            where: transactionWhere,
            orderBy: { date: "desc" },
            take: limit,
            include: {
                account: true,
                toAccount: true
            }
        });

        // Calculate basic stats (Monthly flow)
        const now = new Date();
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);

        const monthlyTransactions = await prisma.cash_transaction.findMany({
            where: {
                businessId,
                date: { gte: monthStart, lte: monthEnd }
            }
        });

        const income = monthlyTransactions.filter(t => t.type === "INCOME").reduce((acc, t) => acc + t.amount, 0);
        const expense = monthlyTransactions.filter(t => t.type === "EXPENSE").reduce((acc, t) => acc + t.amount, 0);

        const stats = {
            netLiquidity: accounts.reduce((acc, a) => acc + a.balance, 0),
            monthlyNetFlow: income - expense,
            expectedPayments: 0,
            expectedCollections: 0,
            incomeTrend: income > 0 ? "+%15" : "%0",
            expenseTrend: expense > 0 ? "-%5" : "%0"
        };

        // Chart: last 7 days daily income/expense
        const sevenDaysAgo = startOfDay(subDays(now, 6));
        const last7Transactions = await prisma.cash_transaction.findMany({
            where: { businessId, date: { gte: sevenDaysAgo } },
            select: { type: true, amount: true, date: true }
        });
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
            const d = startOfDay(subDays(now, i));
            const dayIncome = last7Transactions
                .filter(t => t.type === "INCOME" && startOfDay(new Date(t.date)).getTime() === d.getTime())
                .reduce((s, t) => s + t.amount, 0);
            const dayExpense = last7Transactions
                .filter(t => t.type === "EXPENSE" && startOfDay(new Date(t.date)).getTime() === d.getTime())
                .reduce((s, t) => s + t.amount, 0);
            chartData.push({
                name: DAY_NAMES[d.getDay()],
                income: Math.round(dayIncome * 100) / 100,
                expense: Math.round(dayExpense * 100) / 100
            });
        }

        return NextResponse.json({ accounts, transactions, stats, chartData });
    } catch (error) {
        console.error("Cash GET Error:", error);
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
        const { type, amount, accountId, toAccountId, category, description, date } = body;
        const businessId = session.user.businessId;

        if (!accountId || !amount || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const transaction = await prisma.$transaction(async (tx) => {
            // 1. Create the transaction
            const newTransaction = await tx.cash_transaction.create({
                data: {
                    id: crypto.randomUUID(),
                    businessId,
                    accountId,
                    toAccountId,
                    type,
                    amount: parseFloat(amount),
                    category,
                    description,
                    date: date ? new Date(date) : new Date()
                }
            });

            // 2. Update account balances
            if (type === "INCOME") {
                await tx.cash_account.update({
                    where: { id: accountId },
                    data: { balance: { increment: parseFloat(amount) } }
                });
            } else if (type === "EXPENSE") {
                await tx.cash_account.update({
                    where: { id: accountId },
                    data: { balance: { decrement: parseFloat(amount) } }
                });
            } else if (type === "TRANSFER" && toAccountId) {
                // Decrement from source
                await tx.cash_account.update({
                    where: { id: accountId },
                    data: { balance: { decrement: parseFloat(amount) } }
                });
                // Increment to target
                await tx.cash_account.update({
                    where: { id: toAccountId },
                    data: { balance: { increment: parseFloat(amount) } }
                });
            }

            return newTransaction;
        });

        return NextResponse.json(transaction);
    } catch (error) {
        console.error("Cash POST Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
