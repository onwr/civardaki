// Mock data for user cart

export const mockCart = {
  items: [
    {
      id: "cart-item-1",
      businessId: "1",
      businessName: "Lezzet Dönercisi",
      productId: "p1",
      productName: "Tavuk Döner Dürüm",
      price: 45.0,
      quantity: 2,
      variant: {
        name: "Boy",
        value: "Orta",
      },
      image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=400&fit=crop",
      total: 90.0,
    },
    {
      id: "cart-item-2",
      businessId: "1",
      businessName: "Lezzet Dönercisi",
      productId: "p2",
      productName: "Köfte Menü",
      price: 65.0,
      quantity: 1,
      variant: null,
      image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=400&fit=crop",
      total: 65.0,
    },
  ],
  subtotal: 155.0,
  deliveryFee: 10.0,
  total: 165.0,
};

export const mockAddresses = [
  {
    id: "addr-1",
    title: "Ev",
    address: "Bağdat Caddesi No:123, Daire:5",
    district: "Kadıköy",
    city: "İstanbul",
    postalCode: "34710",
    phone: "+90 555 123 4567",
    isDefault: true,
  },
  {
    id: "addr-2",
    title: "İş",
    address: "Moda Caddesi No:45, Daire:12",
    district: "Kadıköy",
    city: "İstanbul",
    postalCode: "34710",
    phone: "+90 555 234 5678",
    isDefault: false,
  },
];

