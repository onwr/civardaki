// Mock data for user dashboard

import { mockOrders } from "./user-orders";
import { mockAppointments, mockRequests } from "./user-appointments";
import { mockBusinesses } from "./user-businesses";

// Kullanıcı istatistikleri
export const mockUserStats = {
  totalOrders: mockOrders.length,
  activeOrders: mockOrders.filter((o) =>
    ["pending", "confirmed", "preparing", "on_the_way"].includes(o.status)
  ).length,
  completedOrders: mockOrders.filter((o) => o.status === "completed").length,
  totalSpent: mockOrders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + o.total, 0),
  activeAppointments: mockAppointments.filter(
    (a) => a.status === "pending" || a.status === "confirmed"
  ).length,
  favoriteBusinesses: 3,
  viewedBusinesses: 12,
};

// Popüler firmalar (en çok görüntülenen)
export const popularBusinesses = [...mockBusinesses]
  .sort((a, b) => b.viewCount - a.viewCount)
  .slice(0, 4);

// Son görüntülenen firmalar
export const recentlyViewedBusinesses = [
  mockBusinesses[0],
  mockBusinesses[2],
  mockBusinesses[4],
];

// Son aktiviteler
export const recentActivities = [
  {
    id: "act-1",
    type: "order",
    title: "Sipariş verildi",
    description: "Lezzet Dönercisi'nden sipariş verildi",
    date: new Date("2024-10-19T14:30:00"),
    icon: "🛒",
  },
  {
    id: "act-2",
    type: "appointment",
    title: "Randevu oluşturuldu",
    description: "Dr. Mehmet Yılmaz'a randevu alındı",
    date: new Date("2024-10-19T10:00:00"),
    icon: "📅",
  },
  {
    id: "act-3",
    type: "view",
    title: "Firma görüntülendi",
    description: "Kadıköy Market görüntülendi",
    date: new Date("2024-10-18T16:45:00"),
    icon: "👁️",
  },
  {
    id: "act-4",
    type: "review",
    title: "Değerlendirme yapıldı",
    description: "Lezzet Dönercisi değerlendirildi",
    date: new Date("2024-10-17T20:00:00"),
    icon: "⭐",
  },
];

// Önerilen kategoriler (kullanıcının ilgi alanına göre)
export const recommendedCategories = [
  {
    id: "yemek-icecek",
    name: "Yemek İçecek",
    icon: "🍽️",
    count: 45,
    description: "Yakınında 45 restoran",
  },
  {
    id: "alisveris",
    name: "Alışveriş",
    icon: "🛒",
    count: 28,
    description: "Yakınında 28 market",
  },
  {
    id: "guzellik-saglik",
    name: "Güzellik Sağlık",
    icon: "💅",
    count: 15,
    description: "Yakınında 15 salon",
  },
];

