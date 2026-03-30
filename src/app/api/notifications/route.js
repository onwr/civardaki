import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Mock data for static demo
const mockNotifications = [
  {
    id: "1",
    userId: "mock-user-id",
    businessId: "mock-business-id",
    type: "ORDER_NEW",
    title: "Yeni Sipariş",
    message: "Yeni bir sipariş aldınız. Detaylar için tıklayın.",
    relatedId: "order-1",
    relatedType: "order",
    actionUrl: "/business/orders",
    isRead: false,
    readAt: null,
    createdAt: new Date(),
    user: {
      name: "Demo Kullanıcı",
      email: "demo@example.com",
    },
    business: {
      businessName: "Demo İşletme",
    },
  },
  {
    id: "2",
    userId: "mock-user-id",
    businessId: "mock-business-id",
    type: "PAYMENT_REMINDER",
    title: "Ödeme Hatırlatması",
    message: "Abonelik ödemeniz yakında sona erecek.",
    relatedId: null,
    relatedType: "subscription",
    actionUrl: "/business/cash/accounts",
    isRead: false,
    readAt: null,
    createdAt: new Date(Date.now() - 3600000),
    user: null,
    business: {
      businessName: "Demo İşletme",
    },
  },
  {
    id: "3",
    userId: "mock-user-id",
    businessId: "mock-business-id",
    type: "REVIEW_NEW",
    title: "Yeni Yorum",
    message: "Firmanıza yeni bir yorum yapıldı.",
    relatedId: "review-1",
    relatedType: "review",
    actionUrl: "/business/reviews",
    isRead: true,
    readAt: new Date(Date.now() - 86400000),
    createdAt: new Date(Date.now() - 86400000),
    user: {
      name: "Ali Veli",
      email: "ali@example.com",
    },
    business: {
      businessName: "Demo İşletme",
    },
  },
];

// GET /api/notifications - Bildirimleri getir
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    // Filter notifications
    let filteredNotifications = [...mockNotifications];
    if (unreadOnly) {
      filteredNotifications = filteredNotifications.filter((n) => !n.isRead);
    }

    // Calculate pagination
    const totalCount = filteredNotifications.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotifications = filteredNotifications.slice(
      startIndex,
      endIndex
    );

    // Calculate unread count
    const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

    return NextResponse.json({
      notifications: paginatedNotifications,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      unreadCount,
    });
  } catch (error) {
    console.error("Bildirimler getirilemedi:", error);
    return NextResponse.json(
      { error: "Bildirimler getirilemedi" },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Yeni bildirim oluştur
export async function POST(request) {
  try {
    const body = await request.json();
    const { type, title, message, relatedId, relatedType, actionUrl } = body;

    // Create mock notification
    const notification = {
      id: Date.now().toString(),
      userId: "mock-user-id",
      businessId: "mock-business-id",
      type,
      title,
      message,
      relatedId,
      relatedType,
      actionUrl,
      isRead: false,
      readAt: null,
      createdAt: new Date(),
      user: {
        name: "Demo Kullanıcı",
        email: "demo@example.com",
      },
      business: {
        businessName: "Demo İşletme",
      },
    };

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Bildirim oluşturulamadı:", error);
    return NextResponse.json(
      { error: "Bildirim oluşturulamadı" },
      { status: 500 }
    );
  }
}

// PUT /api/notifications - Bildirimleri güncelle
export async function PUT(request) {
  try {
    const body = await request.json();
    const { notificationIds, isRead, markAllAsRead } = body;

    let updatedCount = 0;

    if (markAllAsRead) {
      // In a real implementation, this would update the database
      updatedCount = mockNotifications.filter((n) => !n.isRead).length;
    } else if (notificationIds && notificationIds.length > 0) {
      updatedCount = notificationIds.length;
    }

    return NextResponse.json({
      success: true,
      updatedCount,
    });
  } catch (error) {
    console.error("Bildirimler güncellenemedi:", error);
    return NextResponse.json(
      { error: "Bildirimler güncellenemedi" },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications - Bildirimleri sil
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get("id");

    if (!notificationId) {
      return NextResponse.json(
        { error: "Bildirim ID gerekli" },
        { status: 400 }
      );
    }

    // In a real implementation, this would delete from the database
    const deletedCount = 1;

    return NextResponse.json({ success: true, deletedCount });
  } catch (error) {
    console.error("Bildirim silinemedi:", error);
    return NextResponse.json({ error: "Bildirim silinemedi" }, { status: 500 });
  }
}
