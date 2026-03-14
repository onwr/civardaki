import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.businessId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const businessId = session.user.businessId;

        // Create 3 demo orders
        const demoOrders = [
            {
                orderNumber: "SIP-" + Math.floor(Math.random() * 90000 + 10000),
                customerName: "Ahmet Yılmaz",
                customerLoc: "Kadıköy, İstanbul",
                customerAvatar: "https://i.pravatar.cc/150?u=ahmet",
                customerNote: "Kapıya asın lütfen",
                type: "PRODUCT",
                status: "PENDING",
                deliveryType: "Motorlu Kurye",
                paymentMethod: "Kredi Kartı",
                subtotal: 125.5,
                total: 125.5,
                items: {
                    create: [
                        { name: "Tavuk Döner Menü", qty: 2, price: 90.0 },
                        { name: "Sütaş Ayran", qty: 1, price: 35.5 },
                    ]
                },
                updatedAt: new Date(),
            },
            {
                orderNumber: "SIP-" + Math.floor(Math.random() * 90000 + 10000),
                customerName: "Ayşe Demir",
                customerLoc: "Çankaya, Ankara",
                customerAvatar: "https://i.pravatar.cc/150?u=ayse",
                customerNote: "Tuzsuz olsun",
                type: "PRODUCT",
                status: "CONFIRMED",
                deliveryType: "Mağazadan Teslim",
                paymentMethod: "Cüzdan (Bakiye)",
                subtotal: 89.0,
                total: 89.0,
                items: {
                    create: [
                        { name: "Mercimek Çorbası", qty: 1, price: 65.0 },
                        { name: "Tam Buğday Ekmek", qty: 3, price: 24.0 },
                    ]
                },
                updatedAt: new Date(),
            },
            {
                orderNumber: "SIP-" + Math.floor(Math.random() * 90000 + 10000),
                customerName: "Mehmet Kaya",
                customerLoc: "Konak, İzmir",
                customerAvatar: "https://i.pravatar.cc/150?u=mehmet",
                customerNote: "Zil çalışmıyor, telefondan ulaşın",
                type: "SERVICE",
                status: "PREPARING",
                deliveryType: "Adreste Hizmet",
                paymentMethod: "Nakit",
                subtotal: 150.0,
                total: 150.0,
                items: {
                    create: [
                        { name: "Kombi Bakım Hizmeti", qty: 1, price: 150.0 },
                    ]
                },
                updatedAt: new Date(),
            }
        ];

        for (const orderData of demoOrders) {
            const { items, ...rest } = orderData;
            await prisma.order.create({
                data: {
                    ...rest,
                    businessId,
                    items: items,
                },
            });
        }

        return NextResponse.json({ success: true, count: demoOrders.length });
    } catch (error) {
        console.error("Orders Seed Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
