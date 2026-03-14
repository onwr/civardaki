// Mock data for Dashboard

// İşletme bilgileri
export const mockBusinessInfo = {
  name: "Modern İşletme",
  type: "individual", // 'individual' or 'corporate'
  category: "Genel",
  logo: "/logo.png",
  bannerImage: "/images/hero-back.png",
  address: "Merkez Mahallesi, Atatürk Caddesi No:123",
  city: "İstanbul",
  phone: "+90 212 555 0123",
  email: "info@modernisletme.com",
  rating: 4.7,
  totalReviews: 128,
  totalOrders: 1247,
  description: "Kaliteli hizmet ve müşteri memnuniyeti odaklı modern işletme.",
};

// İstatistikler
export const mockStats = {
  todaySales: 12,
  todayRevenue: 2450.5,
  totalCustomers: 156,
  pendingWork: 3,
  completedToday: 8,
  monthlyRevenue: 48750.0,
  newCustomers: 8,
  cancellationRate: 2.3,
  monthlyGrowth: 15.2,
  rating: 4.7,
  weeklyGrowth: 8.5,
  averageOrderValue: 204.2,
  customerRetentionRate: 87.5,
};

// Haftalık performans verileri
export const mockWeeklyData = [
  { day: "Pzt", sales: 1200, orders: 8, target: 1000, customers: 5 },
  { day: "Sal", sales: 1800, orders: 12, target: 1500, customers: 8 },
  { day: "Çar", sales: 2200, orders: 15, target: 1800, customers: 10 },
  { day: "Per", sales: 1600, orders: 10, target: 1600, customers: 7 },
  { day: "Cum", sales: 2800, orders: 18, target: 2000, customers: 12 },
  { day: "Cmt", sales: 2100, orders: 14, target: 1900, customers: 9 },
  { day: "Paz", sales: 1450, orders: 9, target: 1200, customers: 6 },
];

// Aylık performans verileri
export const mockMonthlyData = [
  { month: "Oca", revenue: 42000, orders: 245, customers: 45 },
  { month: "Şub", revenue: 38500, orders: 220, customers: 38 },
  { month: "Mar", revenue: 45200, orders: 268, customers: 52 },
  { month: "Nis", revenue: 48750, orders: 285, customers: 58 },
  { month: "May", revenue: 51200, orders: 298, customers: 62 },
  { month: "Haz", revenue: 48900, orders: 275, customers: 55 },
];

// Bekleyen işler
export const mockPendingTasks = [
  {
    id: "1",
    title: "Elektrik Tesisatı Tamiri",
    customer: "Ahmet Yılmaz",
    date: "2024-01-25",
    time: "14:00",
    status: "urgent",
    amount: 450.0,
    priority: "high",
    type: "service",
    location: "Kadıköy, İstanbul",
    phone: "+90 555 123 4567",
  },
  {
    id: "2",
    title: "Klima Montajı",
    customer: "Mehmet Kaya",
    date: "2024-01-26",
    time: "10:00",
    status: "pending",
    amount: 800.0,
    priority: "medium",
    type: "installation",
    location: "Beşiktaş, İstanbul",
    phone: "+90 555 234 5678",
  },
  {
    id: "3",
    title: "Tesisat Kontrolü",
    customer: "Ayşe Demir",
    date: "2024-01-26",
    time: "15:30",
    status: "pending",
    amount: 350.0,
    priority: "low",
    type: "inspection",
    location: "Şişli, İstanbul",
    phone: "+90 555 345 6789",
  },
  {
    id: "4",
    title: "Boya Badana İşleri",
    customer: "Fatma Özkan",
    date: "2024-01-27",
    time: "09:00",
    status: "pending",
    amount: 1200.0,
    priority: "medium",
    type: "service",
    location: "Üsküdar, İstanbul",
    phone: "+90 555 456 7890",
  },
  {
    id: "5",
    title: "Cam Değişimi",
    customer: "Ali Çelik",
    date: "2024-01-27",
    time: "11:00",
    status: "urgent",
    amount: 650.0,
    priority: "high",
    type: "repair",
    location: "Beyoğlu, İstanbul",
    phone: "+90 555 567 8901",
  },
];

// Son aktiviteler
export const mockRecentActivities = [
  {
    id: "1",
    type: "sale",
    customer: "Ahmet Yılmaz",
    amount: 450.0,
    time: "10 dakika önce",
    status: "completed",
    icon: "ShoppingCartIcon",
    color: "green",
  },
  {
    id: "2",
    type: "reservation",
    customer: "Mehmet Kaya",
    amount: 0,
    time: "25 dakika önce",
    status: "pending",
    icon: "ClockIcon",
    color: "blue",
  },
  {
    id: "3",
    type: "quote",
    customer: "Ayşe Demir",
    amount: 1200.0,
    time: "1 saat önce",
    status: "sent",
    icon: "DocumentTextIcon",
    color: "purple",
  },
  {
    id: "4",
    type: "sale",
    customer: "Fatma Özkan",
    amount: 350.0,
    time: "2 saat önce",
    status: "completed",
    icon: "ShoppingCartIcon",
    color: "green",
  },
  {
    id: "5",
    type: "payment",
    customer: "Ali Çelik",
    amount: 800.0,
    time: "3 saat önce",
    status: "completed",
    icon: "CurrencyDollarIcon",
    color: "green",
  },
  {
    id: "6",
    type: "reservation",
    customer: "Zeynep Yıldız",
    amount: 0,
    time: "4 saat önce",
    status: "confirmed",
    icon: "CheckCircleIcon",
    color: "blue",
  },
  {
    id: "7",
    type: "sale",
    customer: "Can Arslan",
    amount: 950.0,
    time: "5 saat önce",
    status: "completed",
    icon: "ShoppingCartIcon",
    color: "green",
  },
];

// Müşteri segmentasyonu
export const mockCustomerSegmentation = [
  { name: "Yeni Müşteriler", value: 25, color: "#3b82f6" },
  { name: "Düzenli Müşteriler", value: 45, color: "#10b981" },
  { name: "VIP Müşteriler", value: 15, color: "#f59e0b" },
  { name: "Pasif Müşteriler", value: 15, color: "#6b7280" },
];

// Gelir dağılımı
export const mockRevenueDistribution = [
  { name: "Hizmet Satışları", value: 65, amount: 31687.5, color: "#3b82f6" },
  { name: "Ürün Satışları", value: 25, amount: 12187.5, color: "#10b981" },
  { name: "Abonelikler", value: 7, amount: 3412.5, color: "#f59e0b" },
  { name: "Diğer", value: 3, amount: 1462.5, color: "#8b5cf6" },
];

// Performans metrikleri
export const mockPerformanceMetrics = {
  averageResponseTime: "2.5 saat",
  customerSatisfaction: 4.7,
  completionRate: 94.5,
  onTimeDelivery: 96.2,
  repeatCustomerRate: 68.3,
};

