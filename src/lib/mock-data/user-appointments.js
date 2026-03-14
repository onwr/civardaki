// Mock data for user appointments and requests

export const mockAppointments = [
  {
    id: "apt-1",
    businessId: "3",
    businessName: "Dr. Mehmet Yılmaz",
    businessLogo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop",
    serviceId: "s1",
    serviceName: "Genel Muayene",
    appointmentDate: new Date("2026-01-20T10:00:00"),
    status: "confirmed", // pending, confirmed, completed, cancelled
    notes: "Yıllık kontrol",
    address: "Nişantaşı, Valikonağı Cad. No:12, Şişli/İstanbul",
    phone: "0212 555 12 34",
    price: 300,
    duration: 30,
    createdAt: new Date("2026-01-10T14:00:00"),
  },
  {
    id: "apt-2",
    businessId: "3",
    businessName: "Dr. Mehmet Yılmaz",
    businessLogo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop",
    serviceId: "s2",
    serviceName: "Aşı",
    appointmentDate: new Date("2026-01-18T14:30:00"),
    status: "pending",
    notes: "Kuduz Aşısı 2. Doz",
    address: "Nişantaşı, Valikonağı Cad. No:12, Şişli/İstanbul",
    phone: "0212 555 12 34",
    price: 150,
    duration: 15,
    createdAt: new Date("2026-01-12T16:00:00"),
  },
  {
    id: "apt-3",
    businessId: "5",
    businessName: "Pera Güzellik Salonu",
    businessLogo: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=200&fit=crop",
    serviceId: "s6",
    serviceName: "Saç Kesimi & Bakım",
    appointmentDate: new Date("2026-01-10T15:00:00"),
    status: "completed",
    notes: "Rüya Hanım randevusu",
    address: "İstiklal Cad. No:78, Beyoğlu/İstanbul",
    phone: "0212 444 55 66",
    price: 650,
    duration: 90,
    createdAt: new Date("2026-01-05T10:00:00"),
    completedAt: new Date("2026-01-10T16:30:00"),
    rating: 5,
    review: "Harika bir hizmet, Rüya Hanım çok ilgiliydi!",
  },
  {
    id: "apt-4",
    businessId: "10",
    businessName: "FitLife Pilates",
    businessLogo: "https://images.unsplash.com/photo-1518611012118-e960c7b63a42?w=200&h=200&fit=crop",
    serviceId: "s10",
    serviceName: "Reformerk Pilates",
    appointmentDate: new Date("2026-01-16T18:00:00"),
    status: "confirmed",
    notes: "Havlunuzu getirmeyi unutmayın",
    address: "Moda, Caferağa Mah. No:44, Kadıköy/İstanbul",
    phone: "0216 333 44 55",
    price: 450,
    duration: 50,
    createdAt: new Date("2026-01-14T09:00:00"),
  },
];

export const mockRequests = [
  {
    id: "req-1",
    businessId: "4",
    businessName: "Hızlı Tamir Servisi",
    businessLogo: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=200&h=200&fit=crop",
    serviceId: "s3",
    serviceName: "Elektrikçi Hizmeti",
    requestDate: new Date("2024-10-19T09:00:00"),
    status: "confirmed", // pending, confirmed, in_progress, completed, cancelled
    type: "technical", // technical, emergency
    address: "Bağdat Caddesi No:123, Daire:5, Kadıköy, İstanbul",
    problemDescription: "Elektrik kesintisi var, sigorta atıyor",
    estimatedPrice: 200,
    actualPrice: null,
    estimatedTime: new Date("2024-10-19T11:00:00"),
    completedAt: null,
    createdAt: new Date("2024-10-19T08:30:00"),
  },
  {
    id: "req-2",
    businessId: "4",
    businessName: "Hızlı Tamir Servisi",
    businessLogo: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=200&h=200&fit=crop",
    serviceId: "s5",
    serviceName: "Acil Çilingir",
    requestDate: new Date("2024-10-18T22:00:00"),
    status: "completed",
    type: "emergency",
    address: "Moda Caddesi No:45, Daire:12, Kadıköy, İstanbul",
    problemDescription: "Anahtarı evde unuttum, acil çilingir lazım",
    estimatedPrice: 300,
    actualPrice: 300,
    estimatedTime: new Date("2024-10-18T22:30:00"),
    completedAt: new Date("2024-10-18T22:25:00"),
    createdAt: new Date("2024-10-18T21:45:00"),
    rating: 5,
    review: "Çok hızlı geldiler, sorunumu çözdüler",
  },
  {
    id: "req-3",
    businessId: "4",
    businessName: "Hızlı Tamir Servisi",
    businessLogo: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=200&h=200&fit=crop",
    serviceId: "s4",
    serviceName: "Tesisatçı Hizmeti",
    requestDate: new Date("2024-10-21T10:00:00"),
    status: "pending",
    type: "technical",
    address: "Fenerbahçe Mahallesi, Sokak No:7, Kadıköy, İstanbul",
    problemDescription: "Musluktan su akıyor, tamir edilmesi gerekiyor",
    estimatedPrice: 250,
    actualPrice: null,
    estimatedTime: new Date("2024-10-21T12:00:00"),
    completedAt: null,
    createdAt: new Date("2024-10-20T15:00:00"),
  },
];

export function getAppointmentStatusText(status) {
  const statusMap = {
    pending: "Beklemede",
    confirmed: "Onaylandı",
    completed: "Tamamlandı",
    cancelled: "İptal Edildi",
  };
  return statusMap[status] || status;
}

export function getRequestStatusText(status) {
  const statusMap = {
    pending: "Beklemede",
    confirmed: "Onaylandı",
    in_progress: "Devam Ediyor",
    completed: "Tamamlandı",
    cancelled: "İptal Edildi",
  };
  return statusMap[status] || status;
}

export function getStatusColor(status) {
  const colorMap = {
    pending: "yellow",
    confirmed: "blue",
    in_progress: "purple",
    completed: "green",
    cancelled: "red",
  };
  return colorMap[status] || "gray";
}

