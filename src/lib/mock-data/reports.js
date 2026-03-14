// Mock data for Reports modules

export const mockSalesPurchasesData = {
  sales: {
    total: 125000.0,
    count: 850,
    average: 147.06,
    growth: 12.5,
    chartData: [
      { date: "2024-10-13", sales: 4500, purchases: 2800 },
      { date: "2024-10-14", sales: 5200, purchases: 3200 },
      { date: "2024-10-15", sales: 4800, purchases: 2900 },
      { date: "2024-10-16", sales: 6100, purchases: 3500 },
      { date: "2024-10-17", sales: 5500, purchases: 3300 },
      { date: "2024-10-18", sales: 6800, purchases: 4000 },
      { date: "2024-10-19", sales: 7200, purchases: 4200 },
    ],
  },
  purchases: {
    total: 75000.0,
    count: 320,
    average: 234.38,
    growth: 8.3,
  },
};

export const mockFinancialData = {
  revenue: {
    total: 125000.0,
    growth: 12.5,
    breakdown: [
      { category: "Satışlar", amount: 100000.0, percentage: 80 },
      { category: "Hizmetler", amount: 20000.0, percentage: 16 },
      { category: "Diğer", amount: 5000.0, percentage: 4 },
    ],
  },
  expenses: {
    total: 75000.0,
    growth: 5.2,
    breakdown: [
      { category: "Malzeme", amount: 35000.0, percentage: 46.67 },
      { category: "Personel", amount: 25000.0, percentage: 33.33 },
      { category: "Kira", amount: 10000.0, percentage: 13.33 },
      { category: "Faturalar", amount: 3000.0, percentage: 4 },
      { category: "Diğer", amount: 2000.0, percentage: 2.67 },
    ],
  },
  profit: {
    total: 50000.0,
    margin: 40.0,
    growth: 25.0,
  },
  cashFlow: [
    { month: "Ocak", income: 10000, expense: 7000, net: 3000 },
    { month: "Şubat", income: 12000, expense: 7500, net: 4500 },
    { month: "Mart", income: 15000, expense: 8000, net: 7000 },
    { month: "Nisan", income: 18000, expense: 8500, net: 9500 },
    { month: "Mayıs", income: 20000, expense: 9000, net: 11000 },
    { month: "Haziran", income: 22000, expense: 9500, net: 12500 },
  ],
};

export const mockInventoryData = {
  totalProducts: 45,
  totalValue: 125000.0,
  lowStockCount: 5,
  outOfStockCount: 2,
  turnoverRate: 8.5,
  products: [
    {
      id: "1",
      name: "Tavuk Döner",
      currentStock: 50,
      minStock: 20,
      maxStock: 100,
      unit: "kg",
      value: 2500.0,
      turnoverRate: 12.5,
      status: "NORMAL",
    },
    {
      id: "2",
      name: "Köfte",
      currentStock: 15,
      minStock: 20,
      maxStock: 80,
      unit: "kg",
      value: 1200.0,
      turnoverRate: 10.2,
      status: "LOW",
    },
    {
      id: "3",
      name: "Lahmacun",
      currentStock: 0,
      minStock: 50,
      maxStock: 200,
      unit: "adet",
      value: 0,
      turnoverRate: 15.8,
      status: "OUT_OF_STOCK",
    },
    {
      id: "4",
      name: "Pide",
      currentStock: 30,
      minStock: 30,
      maxStock: 150,
      unit: "adet",
      value: 1500.0,
      turnoverRate: 9.3,
      status: "NORMAL",
    },
    {
      id: "5",
      name: "Ayran",
      currentStock: 200,
      minStock: 100,
      maxStock: 500,
      unit: "lt",
      value: 800.0,
      turnoverRate: 18.5,
      status: "NORMAL",
    },
  ],
  warehouses: [
    {
      id: "1",
      name: "Ana Depo",
      totalValue: 85000.0,
      productCount: 30,
    },
    {
      id: "2",
      name: "Soğuk Hava Deposu",
      totalValue: 35000.0,
      productCount: 12,
    },
    {
      id: "3",
      name: "Yedek Depo",
      totalValue: 5000.0,
      productCount: 3,
    },
  ],
};

export const mockCustomerListData = {
  totalCustomers: 156,
  segments: [
    {
      name: "VIP",
      count: 25,
      totalSpent: 45000.0,
      averageOrder: 1800.0,
      customers: [
        {
          id: "1",
          name: "Ahmet Yılmaz",
          email: "ahmet@example.com",
          phone: "+90 555 123 4567",
          totalOrders: 12,
          totalSpent: 2150.5,
          lastOrderDate: new Date("2024-10-19"),
          segment: "VIP",
        },
        {
          id: "2",
          name: "Mehmet Kaya",
          email: "mehmet@example.com",
          phone: "+90 555 234 5678",
          totalOrders: 8,
          totalSpent: 1890.0,
          lastOrderDate: new Date("2024-10-18"),
          segment: "VIP",
        },
      ],
    },
    {
      name: "Düzenli",
      count: 80,
      totalSpent: 60000.0,
      averageOrder: 750.0,
    },
    {
      name: "Yeni",
      count: 35,
      totalSpent: 5000.0,
      averageOrder: 142.86,
    },
    {
      name: "Pasif",
      count: 16,
      totalSpent: 2000.0,
      averageOrder: 125.0,
    },
  ],
  rfmAnalysis: [
    {
      segment: "Champions",
      count: 20,
      description: "Sık sık alışveriş yapan, yüksek harcama yapan müşteriler",
    },
    {
      segment: "Loyal Customers",
      count: 35,
      description: "Düzenli alışveriş yapan müşteriler",
    },
    {
      segment: "Potential Loyalists",
      count: 40,
      description: "Yeni müşteriler, potansiyel sadık müşteriler",
    },
    {
      segment: "At Risk",
      count: 30,
      description: "Eski müşteriler, tekrar kazanılması gereken",
    },
    {
      segment: "Lost",
      count: 31,
      description: "Uzun süredir alışveriş yapmayan müşteriler",
    },
  ],
};

