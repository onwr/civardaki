import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/orders – Müşteri siparişi oluştur (sepetten).
 * Body: {
 *   businessSlug: string,
 *   customerName: string,
 *   customerPhone?: string,
 *   deliveryAddress: { title?, line1, line2?, city, district, phone? },
 *   deliveryType: "delivery" | "pickup" | "getir" | "yolcu",
 *   paymentMethod: "cash" | "card" | "online",
 *   note?: string,
 *   items: [{ name, qty, price, optionsText? }],
 *   subtotal: number,
 *   deliveryFee?: number,
 *   total: number
 * }
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const {
            businessSlug,
            customerName,
            customerPhone,
            deliveryAddress,
            deliveryType,
            paymentMethod,
            note,
            items,
            subtotal,
            deliveryFee = 0,
            total,
        } = body;

        if (!businessSlug || !customerName || !items?.length || total == null) {
            return NextResponse.json(
                { error: "Eksik alan: businessSlug, customerName, items ve total zorunludur." },
                { status: 400 }
            );
        }

        const business = await prisma.business.findUnique({
            where: { slug: businessSlug, isActive: true },
            select: { id: true, name: true },
        });
        if (!business) {
            return NextResponse.json({ error: "İşletme bulunamadı veya aktif değil." }, { status: 404 });
        }

        const session = await getServerSession(authOptions);
        const customerNoteParts = [];
        if (customerPhone) customerNoteParts.push(`Tel: ${customerPhone}`);
        if (note) customerNoteParts.push(note);
        const customerNote = customerNoteParts.length ? customerNoteParts.join("\n") : null;

        const locParts = [
            deliveryAddress?.line1,
            deliveryAddress?.line2,
            deliveryAddress?.district,
            deliveryAddress?.city,
        ].filter(Boolean);
        const customerLoc = locParts.length ? locParts.join(", ") : deliveryAddress?.address || "Adres belirtilmedi";

        const deliveryTypeLabels = {
            delivery: "Teslimat",
            pickup: "Mağazadan Al",
            getir: "Getir/Yemeksepeti",
            yolcu: "Yolcu",
        };
        const paymentLabels = {
            cash: "Kapıda Nakit",
            card: "Kapıda Kart",
            online: "Online Ödeme",
        };

        const orderNumber =
            "SIP-" +
            new Date().toISOString().slice(0, 10).replace(/-/g, "") +
            "-" +
            Math.floor(1000 + Math.random() * 9000);

        const subtotalNum = Number(subtotal) || 0;
        const totalNum = Number(total) || 0;
        const deliveryFeeNum = Number(deliveryFee) || 0;

        const order = await prisma.order.create({
            data: {
                businessId: business.id,
                userId: session?.user?.id || null,
                orderNumber,
                customerName: String(customerName).trim(),
                customerAvatar: session?.user?.image || null,
                customerLoc,
                customerNote,
                type: "PRODUCT",
                status: "PENDING",
                deliveryType: deliveryTypeLabels[deliveryType] || deliveryType || "Teslimat",
                paymentMethod: paymentLabels[paymentMethod] || paymentMethod || "Kapıda Ödeme",
                subtotal: subtotalNum,
                total: totalNum,
                items: {
                    create: items.map((item) => ({
                        name: String(item.name || "").trim() || "Ürün",
                        qty: Math.max(1, parseInt(item.qty, 10) || 1),
                        price: Number(item.price) || 0,
                        productId: item.productId || null,
                        variantId: item.variantId || null,
                    })),
                },
            },
            include: { items: true },
        });

        if (global.io) {
            try {
                global.io.to(`business_${business.id}`).emit("new_order", {
                    orderId: order.id,
                    orderNumber: order.orderNumber,
                    customerName: order.customerName,
                    total: order.total,
                    createdAt: order.createdAt,
                });
            } catch (e) {
                console.warn("Socket emit new_order failed:", e?.message);
            }
        }

        return NextResponse.json({
            success: true,
            orderId: order.id,
            orderNumber: order.orderNumber,
            total: order.total,
            businessName: business.name,
        });
    } catch (err) {
        console.error("Order create error:", err);
        return NextResponse.json({ error: "Sipariş oluşturulurken hata oluştu." }, { status: 500 });
    }
}
