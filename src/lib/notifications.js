import { prisma } from "./prisma";

// Bildirim tipleri
export const NOTIFICATION_TYPES = {
  ORDER_NEW: "ORDER_NEW",
  ORDER_CONFIRMED: "ORDER_CONFIRMED",
  ORDER_REJECTED: "ORDER_REJECTED",
  ORDER_COMPLETED: "ORDER_COMPLETED",
  PAYMENT_REMINDER: "PAYMENT_REMINDER",
  SUBSCRIPTION_EXPIRING: "SUBSCRIPTION_EXPIRING",
  SUBSCRIPTION_EXPIRED: "SUBSCRIPTION_EXPIRED",
  REVIEW_NEW: "REVIEW_NEW",
  MESSAGE_NEW: "MESSAGE_NEW",
  SYSTEM: "SYSTEM",
};

// Bildirim oluştur
export async function createNotification({
  type,
  title,
  message,
  relatedId,
  relatedType,
  actionUrl,
  targetUserId,
  targetBusinessId,
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        relatedId,
        relatedType,
        actionUrl,
        userId: targetUserId,
        businessId: targetBusinessId,
      },
    });

    // TODO: WebSocket ile gerçek zamanlı bildirim gönder
    await sendRealtimeNotification(notification);

    return notification;
  } catch (error) {
    console.error("Bildirim oluşturulamadı:", error);
    throw error;
  }
}

// Yeni sipariş bildirimi
export async function createOrderNotification(order) {
  const notification = await createNotification({
    type: NOTIFICATION_TYPES.ORDER_NEW,
    title: "Yeni Sipariş!",
    message: `${order.customer.firstName} ${order.customer.lastName} adlı müşteriden yeni sipariş geldi`,
    relatedId: order.id,
    relatedType: "order",
    actionUrl: `/business/orders`,
    targetBusinessId: order.businessId,
  });

  return notification;
}

// Sipariş onay bildirimi
export async function createOrderConfirmedNotification(order) {
  await createNotification({
    type: NOTIFICATION_TYPES.ORDER_CONFIRMED,
    title: "Sipariş Onaylandı",
    message: `Sipariş #${order.orderNumber} onaylandı ve hazırlanmaya başlandı`,
    relatedId: order.id,
    relatedType: "order",
    actionUrl: `/orders/${order.id}`,
    targetUserId: order.customerId,
  });
}

// Sipariş red bildirimi
export async function createOrderRejectedNotification(order, reason) {
  await createNotification({
    type: NOTIFICATION_TYPES.ORDER_REJECTED,
    title: "Sipariş Reddedildi",
    message: `Sipariş #${order.orderNumber} reddedildi. Sebep: ${reason}`,
    relatedId: order.id,
    relatedType: "order",
    actionUrl: `/orders/${order.id}`,
    targetUserId: order.customerId,
  });
}

// Sipariş tamamlanma bildirimi
export async function createOrderCompletedNotification(order) {
  await createNotification({
    type: NOTIFICATION_TYPES.ORDER_COMPLETED,
    title: "Sipariş Tamamlandı",
    message: `Sipariş #${order.orderNumber} başarıyla teslim edildi`,
    relatedId: order.id,
    relatedType: "order",
    actionUrl: `/orders/${order.id}`,
    targetUserId: order.customerId,
  });
}

// Ödeme hatırlatma bildirimi
export async function createPaymentReminderNotification(business, daysLeft) {
  await createNotification({
    type: NOTIFICATION_TYPES.PAYMENT_REMINDER,
    title: "Ödeme Hatırlatması",
    message: `Abonelik ödemeniz ${daysLeft} gün sonra sona eriyor`,
    relatedId: business.id,
    relatedType: "business",
    actionUrl: `/business/cash/accounts`,
    targetBusinessId: business.id,
  });
}

// Abonelik süresi dolma bildirimi
export async function createSubscriptionExpiringNotification(
  business,
  daysLeft
) {
  await createNotification({
    type: NOTIFICATION_TYPES.SUBSCRIPTION_EXPIRING,
    title: "Abonelik Süresi Doluyor",
    message: `Abonelik ödemeniz ${daysLeft} gün sonra sona eriyor`,
    relatedId: business.id,
    relatedType: "business",
    actionUrl: `/business/cash/accounts`,
    targetBusinessId: business.id,
  });
}

// Abonelik süresi dolmuş bildirimi
export async function createSubscriptionExpiredNotification(business) {
  await createNotification({
    type: NOTIFICATION_TYPES.SUBSCRIPTION_EXPIRED,
    title: "Abonelik Süresi Doldu",
    message: "Abonelik süreniz doldu. Hesabınız askıya alındı.",
    relatedId: business.id,
    relatedType: "business",
    actionUrl: `/business/cash/accounts`,
    targetBusinessId: business.id,
  });
}

// Yeni değerlendirme bildirimi
export async function createReviewNotification(review) {
  await createNotification({
    type: NOTIFICATION_TYPES.REVIEW_NEW,
    title: "Yeni Değerlendirme",
    message: `${review.customer.firstName} adlı müşteriden ${review.rating} yıldız değerlendirme geldi`,
    relatedId: review.id,
    relatedType: "review",
    actionUrl: `/business/reports`,
    targetBusinessId: review.businessId,
  });
}

// Yeni mesaj bildirimi
export async function createMessageNotification(message) {
  await createNotification({
    type: NOTIFICATION_TYPES.MESSAGE_NEW,
    title: "Yeni Mesaj",
    message: `${message.sender.firstName} adlı müşteriden yeni mesaj geldi`,
    relatedId: message.id,
    relatedType: "message",
    actionUrl: `/business/messages`,
    targetBusinessId: message.businessId,
  });
}

// Sistem bildirimi
export async function createSystemNotification({
  title,
  message,
  actionUrl,
  targetUserId,
  targetBusinessId,
}) {
  await createNotification({
    type: NOTIFICATION_TYPES.SYSTEM,
    title,
    message,
    actionUrl,
    targetUserId,
    targetBusinessId,
  });
}

// Gerçek zamanlı bildirim gönder (WebSocket)
async function sendRealtimeNotification(notification) {
  try {
    // TODO: WebSocket server ile iletişim kur
    // Bu kısım WebSocket server kurulduktan sonra implement edilecek
    console.log("Gerçek zamanlı bildirim gönderildi:", notification);
  } catch (error) {
    console.error("Gerçek zamanlı bildirim gönderilemedi:", error);
  }
}

// Bildirim istatistikleri
export async function getNotificationStats(userId, businessId) {
  try {
    const where = {
      OR: [{ userId }, { businessId }],
    };

    const [totalCount, unreadCount, recentNotifications] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { ...where, isRead: false } }),
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: { select: { name: true } },
          business: { select: { businessName: true } },
        },
      }),
    ]);

    return {
      totalCount,
      unreadCount,
      recentNotifications,
    };
  } catch (error) {
    console.error("Bildirim istatistikleri alınamadı:", error);
    throw error;
  }
}

// Bildirimleri temizle (eski bildirimleri sil)
export async function cleanupOldNotifications(daysOld = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        isRead: true,
      },
    });

    console.log(`${result.count} eski bildirim temizlendi`);
    return result.count;
  } catch (error) {
    console.error("Eski bildirimler temizlenemedi:", error);
    throw error;
  }
}

// Bildirim tercihlerini kontrol et
export async function checkNotificationPreferences(
  userId,
  businessId,
  notificationType
) {
  try {
    // Kullanıcı tercihlerini kontrol et
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
      },
    });

    // İşletme tercihlerini kontrol et
    const businessSettings = await prisma.businessSetting.findMany({
      where: { businessId },
      select: { key: true, value: true },
    });

    const settings = businessSettings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    // Bildirim tipine göre tercihleri kontrol et
    switch (notificationType) {
      case NOTIFICATION_TYPES.ORDER_NEW:
        return {
          email:
            user?.emailNotifications &&
            settings.notification_email_order_new !== "false",
          sms:
            user?.smsNotifications &&
            settings.notification_sms_order_new !== "false",
          push:
            user?.pushNotifications &&
            settings.notification_push_order_new !== "false",
        };
      case NOTIFICATION_TYPES.PAYMENT_REMINDER:
        return {
          email:
            user?.emailNotifications &&
            settings.notification_email_payment_reminder !== "false",
          sms:
            user?.smsNotifications &&
            settings.notification_sms_payment_reminder !== "false",
          push:
            user?.pushNotifications &&
            settings.notification_push_payment_reminder !== "false",
        };
      default:
        return {
          email: user?.emailNotifications,
          sms: user?.smsNotifications,
          push: user?.pushNotifications,
        };
    }
  } catch (error) {
    console.error("Bildirim tercihleri kontrol edilemedi:", error);
    return {
      email: true,
      sms: true,
      push: true,
    };
  }
}
