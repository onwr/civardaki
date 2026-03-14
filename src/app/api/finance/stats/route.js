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

        const transactions = await prisma.financial_transaction.findMany({
            where: { userId: user.id },
        });

        let totalBalance = 0;
        let monthlyIncome = 0;
        let monthlyExpense = 0;
        let totalDebt = 0;
        let totalCreditCardDebt = 0;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        transactions.forEach((t) => {
            const transactionMonth = new Date(t.date).getMonth();
            const transactionYear = new Date(t.date).getFullYear();
            const isCurrentMonth =
                transactionMonth === currentMonth && transactionYear === currentYear;

            if (t.type === "INCOME") {
                totalBalance += t.amount;
                if (isCurrentMonth) monthlyIncome += t.amount;
            } else if (t.type === "EXPENSE") {
                totalBalance -= t.amount;
                if (isCurrentMonth) monthlyExpense += t.amount;
            } else if (t.type === "DEBT" || t.type === "LOAN") {
                totalDebt += t.amount;
            } else if (t.type === "CREDIT_CARD") {
                totalCreditCardDebt += t.amount;
            }
        });

        // initialBalance kaldırıldı - sadece gerçek işlemler hesaplanıyor
        // Eğer başlangıç bakiyesi istiyorsan, aşağıdaki satırı uncomment et:
        // const initialBalance = 2500;
        // totalBalance += initialBalance;

        return NextResponse.json({
            stats: {
                totalBalance,
                monthlyIncome,
                monthlyExpense,
                totalDebt,
                totalCreditCardDebt,
                monthlyBalance: monthlyIncome - monthlyExpense,
            },
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 }
        );
    }
}