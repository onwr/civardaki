const fs = require("fs");
const p = "src/app/business/products/page.jsx";
let s = fs.readFileSync(p, "utf8");
const emDash = "\u2014";
const map = [
  ["\u00e2\u20ac\u201d", emDash],
  ["\u00e2\u20ac\u201c", emDash],
  ["Kategoriler yÃ¼klenemedi", "Kategoriler yüklenemedi"],
  ["ÃœrÃ¼nler yÃ¼klenemedi", "Ürünler yüklenemedi"],
  ["Marka en az 2 karakter olmalÄ±.", "Marka en az 2 karakter olmalı."],
  ["Marka seÃ§ildi.", "Marka seçildi."],
  ["Raf yeri en az 2 karakter olmalÄ±.", "Raf yeri en az 2 karakter olmalı."],
  ["Raf yeri seÃ§ildi.", "Raf yeri seçildi."],
  ["Kategori adÄ± Ã§ok kÄ±sa", "Kategori adı çok kısa"],
  ["GÃ¼ncellendi", "Güncellendi"],
  ["Hata oluÅŸtu", "Hata oluştu"],
  ["Ä°ÅŸlem baÅŸarÄ±sÄ±z", "İşlem başarısız"],
  ["ÃœrÃ¼n adÄ± Ã§ok kÄ±sa", "Ürün adı çok kısa"],
  [
    "ÃœrÃ¼nÃ¼ silmek istediÄŸinize emin misiniz?",
    "Ürünü silmek istediğinize emin misiniz?",
  ],
  ["ÃœrÃ¼n silindi", "Ürün silindi"],
  ["GÃ¶rsel yÃ¼klendi", "Görsel yüklendi"],
  ["YÃ¼kleme baÅŸarÄ±sÄ±z", "Yükleme başarısız"],
  ["Dosya yÃ¼klenemedi", "Dosya yüklenemedi"],
  ["ÃœrÃ¼n YÃ¶netimi", "Ürün Yönetimi"],
  ["ÃœrÃ¼nler / Hizmetler", "Ürünler & Hizmetler"],
  [
    "ÃœrÃ¼n ve hizmetlerinizi yÃ¶netin, fiyat ve stok bilgilerini takip edin,\n                kategori bazlÄ± filtreleyin ve iÃ§erikleri dÃ¼zenleyin.",
    "İşletmenize ait ürün ve hizmetleri yönetin, fiyat ve stok bilgilerini güncelleyin.",
  ],
  ["Yeni ÃœrÃ¼n/Hizmet Ekle", "Yeni Ürün / Hizmet Ekle"],
  ["Toplam KayÄ±t", "Toplam Kayıt"],
  ["Listelenen Ã¼rÃ¼n / hizmet sayÄ±sÄ±", "Listelenen ürün / hizmet sayısı"],
  ["FiyatlÄ± ÃœrÃ¼n", "Fiyatlı Ürün"],
  ["Fiyat bilgisi girilmiÅŸ kayÄ±t", "Fiyat bilgisi girilmiş kayıt"],
  ["Stok alanÄ± dolu kayÄ±t", "Stok alanı dolu kayıt"],
  ["gÃ¶re Ã¼rÃ¼nleri filtreleyin.", "göre ürünleri filtreleyin."],
  ["Aktif ÃœrÃ¼nler", "Aktif Ürünler"],
  ["TÃ¼m ÃœrÃ¼nler", "Tüm Ürünler"],
  ["TÃ¼m kategoriler", "Tüm kategoriler"],
  ["ÃœrÃ¼n Listesi", "Ürün Listesi"],
  [
    "SeÃ§ili filtrelere gÃ¶re listelenen Ã¼rÃ¼n / hizmet kayÄ±tlarÄ±",
    "Seçili filtrelere göre listelenen ürün / hizmet kayıtları",
  ],
  ["ÃœrÃ¼n Hizmet AdÄ±", "Ürün / Hizmet"],
  ["SatÄ±ÅŸ FiyatÄ±", "Satış Fiyatı"],
  ["Stok MiktarÄ±", "Stok Miktarı"],
  ["Ä°ÅŸlem", "İşlem"],
  ["KayÄ±t bulunamadÄ±.", "Kayıt bulunamadı."],
  ["DÃ¼zenle", "Düzenle"],
  ["Kategori dÃ¼zenle", "Kategori düzenle"],
  ["Kategori adÄ±", "Kategori adı"],
  ["Ã–rn: TatlÄ±lar", "Örn: Tatlılar"],
  ["Ä°ptal", "İptal"],
  ["GÃ¼ncelle", "Güncelle"],
  ["Marka adÄ±", "Marka adı"],
  ["Ã–rn: Ã–rnek Marka", "Örn: Örnek Marka"],
  ["SeÃ§ ve uygula", "Seç ve uygula"],
  ["Raf yeri veya depo adÄ±", "Raf yeri veya depo adı"],
  ["Ã–rn: A-12, Ana depo", "Örn: A-12, Ana depo"],
];
for (const [a, b] of map) {
  s = s.split(a).join(b);
}
fs.writeFileSync(p, s, "utf8");
console.log("replacements done");
