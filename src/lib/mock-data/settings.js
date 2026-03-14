// Mock data for Settings modules

export const mockUsers = [
  {
    id: "1",
    name: "Ahmet Yılmaz",
    email: "ahmet@donerci.com",
    role: "ADMIN",
    permissions: ["ALL"],
    lastLogin: new Date("2024-10-19T14:30:00"),
    status: "ACTIVE",
  },
  {
    id: "2",
    name: "Mehmet Kaya",
    email: "mehmet@donerci.com",
    role: "MANAGER",
    permissions: ["ORDERS", "PRODUCTS", "REPORTS"],
    lastLogin: new Date("2024-10-19T10:15:00"),
    status: "ACTIVE",
  },
  {
    id: "3",
    name: "Ayşe Demir",
    email: "ayse@donerci.com",
    role: "CASHIER",
    permissions: ["ORDERS", "CASH"],
    lastLogin: new Date("2024-10-19T08:00:00"),
    status: "ACTIVE",
  },
  {
    id: "4",
    name: "Fatma Özkan",
    email: "fatma@donerci.com",
    role: "STAFF",
    permissions: ["ORDERS"],
    lastLogin: new Date("2024-10-18T16:45:00"),
    status: "ACTIVE",
  },
  {
    id: "5",
    name: "Ali Çelik",
    email: "ali@donerci.com",
    role: "VIEWER",
    permissions: ["REPORTS"],
    lastLogin: new Date("2024-10-17T12:30:00"),
    status: "INACTIVE",
  },
];

export const mockTemplates = [
  {
    id: "1",
    name: "Standart Fatura Şablonu",
    type: "INVOICE",
    description: "Standart fatura şablonu",
    content: "<html>...</html>",
    isDefault: true,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "Özel Teklif Şablonu",
    type: "QUOTE",
    description: "Özel teklif şablonu",
    content: "<html>...</html>",
    isDefault: false,
    createdAt: new Date("2024-02-15"),
  },
  {
    id: "3",
    name: "Kurumsal Fatura",
    type: "INVOICE",
    description: "Kurumsal müşteriler için",
    content: "<html>...</html>",
    isDefault: false,
    createdAt: new Date("2024-03-01"),
  },
  {
    id: "4",
    name: "Hızlı Teklif",
    type: "QUOTE",
    description: "Hızlı teklif için basit şablon",
    content: "<html>...</html>",
    isDefault: false,
    createdAt: new Date("2024-04-10"),
  },
  {
    id: "5",
    name: "İrsaliye Şablonu",
    type: "WAYBILL",
    description: "İrsaliye şablonu",
    content: "<html>...</html>",
    isDefault: true,
    createdAt: new Date("2024-05-01"),
  },
];

export const mockLabelTemplates = [
  {
    id: "1",
    name: "Standart Etiket",
    size: "10x5",
    layout: "HORIZONTAL",
    fields: ["name", "price", "barcode"],
    isDefault: true,
  },
  {
    id: "2",
    name: "Kompakt Etiket",
    size: "8x4",
    layout: "VERTICAL",
    fields: ["name", "price"],
    isDefault: false,
  },
  {
    id: "3",
    name: "Detaylı Etiket",
    size: "12x6",
    layout: "HORIZONTAL",
    fields: ["name", "price", "barcode", "description", "expiryDate"],
    isDefault: false,
  },
];

export const mockPOSDevices = [
  {
    id: "1",
    name: "Ana Kasa POS",
    deviceId: "POS-001",
    location: "Ana Kasa",
    status: "ACTIVE",
    lastSync: new Date("2024-10-19T14:30:00"),
  },
  {
    id: "2",
    name: "Yan Kasa POS",
    deviceId: "POS-002",
    location: "Yan Kasa",
    status: "ACTIVE",
    lastSync: new Date("2024-10-19T14:25:00"),
  },
];

export const mockCargoIntegrations = [
  {
    id: "1",
    name: "Yurtiçi Kargo",
    apiKey: "****-****-****-1234",
    status: "ACTIVE",
    autoCreate: true,
    lastSync: new Date("2024-10-19T12:00:00"),
  },
  {
    id: "2",
    name: "Aras Kargo",
    apiKey: "****-****-****-5678",
    status: "ACTIVE",
    autoCreate: false,
    lastSync: new Date("2024-10-19T11:30:00"),
  },
  {
    id: "3",
    name: "MNG Kargo",
    apiKey: "****-****-****-9012",
    status: "INACTIVE",
    autoCreate: false,
    lastSync: new Date("2024-10-18T16:00:00"),
  },
];

