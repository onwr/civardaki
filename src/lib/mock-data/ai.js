// AI Mock Data - Statik yanıtlar ve öneriler

// AI Kişilik ve İsim
export const aiPersonality = {
  name: "Civardaki AI",
  greeting: "Merhaba! Ben Civardaki AI, işletmenizin akıllı asistanıyım. Size nasıl yardımcı olabilirim?",
  personality: "yardımsever, profesyonel, samimi",
};

// AI yanıtları - context'e göre ve soru bazlı
export const aiResponses = {
  general: [
    "Size nasıl yardımcı olabilirim? İşletmenizle ilgili sorularınızı yanıtlayabilirim.",
    "Merhaba! İşletmenizin performansını analiz edip öneriler sunabilirim.",
    "Bugün hangi konuda yardıma ihtiyacınız var? Satış, müşteri veya stok yönetimi hakkında bilgi verebilirim.",
  ],
  greetings: [
    "Merhaba! Ben Civardaki AI. İşletmenizle ilgili her konuda size yardımcı olmaya hazırım. Ne hakkında konuşmak istersiniz?",
    "Selam! Bugün size nasıl yardımcı olabilirim? Satışlar, müşteriler, stok veya başka bir konuda sorularınız varsa çekinmeyin!",
    "Hoş geldiniz! Ben sizin akıllı asistanınızım. İşletmenizin performansını analiz edebilir, öneriler sunabilir ve sorularınızı yanıtlayabilirim.",
  ],
  questions: {
    satış: [
      "Satışlarınız son 7 günde %15 arttı. Bu harika bir trend! Bu büyümeyi sürdürmek için en çok satan ürünlerinize odaklanmanızı öneriyorum.",
      "Bugün için 12 sipariş tahmin ediyorum. Dünkü seviyeye göre %8 artış var. Hazırlıklarınızı buna göre yapabilirsiniz.",
      "Satış performansınızı artırmak için öğlen 12-14 ve akşam 18-20 saatleri arasında daha fazla personel bulundurmanızı öneriyorum. Bu saatler en karlı zaman dilimleriniz.",
    ],
    müşteri: [
      "VIP müşterileriniz toplam gelirinizin %45'ini oluşturuyor. Bu müşterilere özel indirimler ve öncelikli hizmet sunarak sadakatlerini artırabilirsiniz.",
      "3 müşteriniz yüksek churn riski taşıyor. Son siparişleri 28 günden fazla önce. Bu müşterilere özel kampanyalar ve kişisel iletişim öneriyorum.",
      "Yeni müşteri kazanma oranınızı artırmak için sosyal medya kampanyaları, referans programları ve özel fırsatlar düzenleyebilirsiniz.",
    ],
    stok: [
      "Stokta azalan 2 ürününüz var. Acil tedarik planlaması yapmanızı öneriyorum. Stok tükenmeden önce sipariş vermeniz iyi olur.",
      "En çok satan ürünleriniz: Tavuk Döner, Köfte Menü ve Ayran. Bu ürünlerde stok seviyelerinizi yüksek tutmanızı öneriyorum.",
      "Stok optimizasyonu için ABC analizi yapabilirsiniz. Yüksek değerli ürünlere daha fazla odaklanarak nakit akışınızı iyileştirebilirsiniz.",
    ],
    finans: [
      "Nakit akışınız sağlıklı görünüyor. Ancak gelecek ay için rezerv oluşturmanızı öneriyorum. 3 aylık bir rezerv ideal olur.",
      "Yüksek karlılığa sahip ürünlerinize odaklanarak nakit akışınızı optimize edebilirsiniz. Bu ürünlerin stok seviyelerini artırabilirsiniz.",
      "Ödemelerinizi düzenli takip ederek finansal planlamanızı iyileştirebilirsiniz. Geciken ödemeler için otomatik hatırlatıcılar kurabilirsiniz.",
    ],
    performans: [
      "İşletmenizin genel performansı çok iyi! Satışlar artıyor, müşteri memnuniyeti yüksek. Bu trendi sürdürmek için mevcut stratejilerinize devam edebilirsiniz.",
      "Müşteri memnuniyet skorunuz 9.5/10. Bu harika bir sonuç! Sadık müşterilerinize özel kampanyalar düzenleyerek bu başarıyı sürdürebilirsiniz.",
      "Ekip performansınız genel olarak iyi. Ancak 2 çalışanınız için ek eğitim öneriyorum. Bu, genel verimliliği artıracaktır.",
    ],
  },
  dashboard: [
    "Dashboard'unuzda son 7 günde satışlarınız %15 arttı. Bu trend devam ederse bu ay %20 büyüme bekleyebilirsiniz.",
    "En çok satan ürünleriniz: Tavuk Döner, Köfte Menü ve Ayran. Bu ürünlere odaklanarak stok planlaması yapabilirsiniz.",
    "Müşteri memnuniyet skorunuz 9.5/10. Bu harika bir sonuç! Sadık müşterilerinize özel kampanyalar düzenleyebilirsiniz.",
  ],
  customers: [
    "VIP müşterileriniz toplam gelirinizin %45'ini oluşturuyor. Bu müşterilere özel indirimler ve öncelikli hizmet sunabilirsiniz.",
    "3 müşteriniz yüksek churn riski taşıyor. Bu müşterilere özel kampanyalar ve kişisel iletişim öneriyorum.",
    "Yeni müşteri kazanma oranınızı artırmak için sosyal medya kampanyaları ve referans programları önerebilirim.",
  ],
  products: [
    "Tavuk Döner ürününüz için SEO optimizasyonu yapabiliriz. 'Taze tavuk döner', 'geleneksel döner' gibi anahtar kelimeler ekleyebiliriz.",
    "Stokta azalan 2 ürününüz var. Acil tedarik planlaması yapmanızı öneriyorum.",
    "En çok satan ürünlerinize benzer yeni ürünler ekleyerek gelirinizi artırabilirsiniz.",
  ],
  cash: [
    "Nakit akışınız sağlıklı görünüyor. Ancak gelecek ay için rezerv oluşturmanızı öneriyorum.",
    "Yüksek karlılığa sahip ürünlerinize odaklanarak nakit akışınızı optimize edebilirsiniz.",
    "Ödemelerinizi düzenli takip ederek finansal planlamanızı iyileştirebilirsiniz.",
  ],
  reports: [
    "Son aylık raporunuza göre satışlarınız istikrarlı bir şekilde artıyor. Bu trend devam ederse yıl sonunda %25 büyüme bekleyebilirsiniz.",
    "Müşteri başına ortalama harcama 276₺. Bu değeri artırmak için cross-sell stratejileri uygulayabilirsiniz.",
    "En karlı saat dilimleriniz öğlen 12-14 ve akşam 18-20 arası. Bu saatlerde daha fazla personel bulundurmanızı öneriyorum.",
  ],
  orders: [
    "Bugün için 12 sipariş tahmin ediyorum. Bu, dünkü seviyeye göre %8 artış demek.",
    "En çok sipariş verilen saatler: 12:00-13:00 ve 19:00-20:00. Bu saatlerde hazırlık yapmanızı öneriyorum.",
    "Tekrarlayan müşterileriniz siparişlerinizin %65'ini oluşturuyor. Bu müşterilere özel fırsatlar sunabilirsiniz.",
  ],
  hr: [
    "Çalışan performansınız genel olarak iyi. Ancak 2 çalışanınız için ek eğitim öneriyorum.",
    "İzin talepleri bu ay yoğun. Personel planlamanızı gözden geçirmenizi öneriyorum.",
    "Ekip motivasyonunu artırmak için performans bazlı ödüller düşünebilirsiniz.",
  ],
};

// AI Önerileri
export const aiSuggestions = {
  dashboard: [
    {
      id: 1,
      type: "sales",
      title: "Satış Artışı Fırsatı",
      description: "En çok satan ürünlerinize odaklanarak satışlarınızı %20 artırabilirsiniz.",
      action: "Ürünleri İncele",
      priority: "high",
      icon: "trending-up",
    },
    {
      id: 2,
      type: "customer",
      title: "Müşteri Memnuniyeti",
      description: "VIP müşterilerinize özel kampanya düzenleyerek sadakatlerini artırabilirsiniz.",
      action: "Kampanya Oluştur",
      priority: "medium",
      icon: "users",
    },
    {
      id: 3,
      type: "inventory",
      title: "Stok Uyarısı",
      description: "2 ürününüzde stok azalıyor. Acil tedarik planlaması yapın.",
      action: "Stokları Kontrol Et",
      priority: "urgent",
      icon: "exclamation",
    },
  ],
  customers: [
    {
      id: 1,
      type: "segment",
      title: "Müşteri Segmentasyonu",
      description: "Müşterilerinizi 3 gruba ayırdım: VIP (%45 gelir), Düzenli (%40 gelir), Yeni (%15 gelir).",
      segments: [
        { name: "VIP", count: 1, revenue: "45%", color: "purple" },
        { name: "Düzenli", count: 1, revenue: "40%", color: "blue" },
        { name: "Yeni", count: 1, revenue: "15%", color: "green" },
      ],
    },
    {
      id: 2,
      type: "churn",
      title: "Churn Risk Analizi",
      description: "3 müşteriniz yüksek risk taşıyor. Bu müşterilere özel kampanyalar öneriyorum.",
      riskCustomers: [
        { name: "Mehmet Kaya", risk: "high", lastOrder: "28 gün önce" },
      ],
    },
  ],
  products: [
    {
      id: 1,
      type: "pricing",
      title: "Fiyat Optimizasyonu",
      description: "Tavuk Döner ürününüz için rekabetçi fiyat önerisi: 45₺ (mevcut) → 42₺ (önerilen). Bu fiyatla satışlarınız %15 artabilir.",
      currentPrice: 45,
      suggestedPrice: 42,
      expectedIncrease: 15,
    },
    {
      id: 2,
      type: "seo",
      title: "SEO Önerileri",
      description: "Ürün açıklamalarınıza şu anahtar kelimeleri ekleyin: 'taze', 'geleneksel', 'ev yapımı', 'organik'.",
      keywords: ["taze", "geleneksel", "ev yapımı", "organik", "lezzetli"],
    },
  ],
  cash: [
    {
      id: 1,
      type: "budget",
      title: "Bütçe Tahmini",
      description: "Gelecek ay için nakit akışı tahmini: Giriş 45.000₺, Çıkış 28.000₺, Net: +17.000₺",
      income: 45000,
      expense: 28000,
      net: 17000,
    },
    {
      id: 2,
      type: "risk",
      title: "Risk Analizi",
      description: "Nakit akışınız sağlıklı. Ancak 3 aylık rezerv oluşturmanızı öneriyorum.",
      riskLevel: "low",
      recommendation: "3 aylık rezerv oluştur",
    },
  ],
  reports: [
    {
      id: 1,
      type: "trend",
      title: "Trend Tahmini",
      description: "Son 3 aylık verilere göre, önümüzdeki ay %12 satış artışı bekleniyor.",
      trend: "up",
      percentage: 12,
      period: "1 ay",
    },
    {
      id: 2,
      type: "comparison",
      title: "Karşılaştırmalı Analiz",
      description: "Bu ay geçen aya göre: Satışlar +%15, Müşteri sayısı +%8, Ortalama sepet +%5",
      metrics: [
        { name: "Satışlar", change: "+15%", trend: "up" },
        { name: "Müşteri Sayısı", change: "+8%", trend: "up" },
        { name: "Ortalama Sepet", change: "+5%", trend: "up" },
      ],
    },
  ],
  orders: [
    {
      id: 1,
      type: "forecast",
      title: "Günlük Sipariş Tahmini",
      description: "Bugün için 12 sipariş tahmin ediyorum. Bu, dünkü seviyeye göre %8 artış.",
      today: 12,
      yesterday: 11,
      change: 8,
    },
    {
      id: 2,
      type: "recommendation",
      title: "Ürün Önerileri",
      description: "Bugün en çok satılması beklenen ürünler: Tavuk Döner, Köfte Menü, Ayran",
      products: ["Tavuk Döner", "Köfte Menü", "Ayran"],
    },
  ],
  hr: [
    {
      id: 1,
      type: "performance",
      title: "Performans Analizi",
      description: "Ekip performansınız genel olarak iyi. 2 çalışan için ek eğitim öneriyorum.",
      overallScore: 8.5,
      recommendations: [
        { employee: "Ahmet Yılmaz", area: "Müşteri İletişimi", score: 7.2 },
        { employee: "Fatma Demir", area: "Satış Teknikleri", score: 7.8 },
      ],
    },
    {
      id: 2,
      type: "training",
      title: "Eğitim Önerileri",
      description: "Ekip için önerilen eğitimler: Müşteri Hizmetleri, Satış Teknikleri, Stok Yönetimi",
      trainings: [
        "Müşteri Hizmetleri",
        "Satış Teknikleri",
        "Stok Yönetimi",
      ],
    },
  ],
};

// AI Analiz Sonuçları
export const aiAnalysis = {
  salesForecast: {
    nextWeek: 1250,
    nextMonth: 5200,
    nextQuarter: 16500,
    trend: "increasing",
    confidence: 85,
  },
  customerSegmentation: {
    vip: { count: 1, revenue: 45, avgOrder: 350 },
    regular: { count: 1, revenue: 40, avgOrder: 200 },
    new: { count: 1, revenue: 15, avgOrder: 150 },
  },
  productRecommendations: [
    {
      productId: "1",
      name: "Tavuk Döner",
      recommendation: "Fiyatı 42₺'ye düşürerek satışları %15 artırabilirsiniz",
      expectedIncrease: 15,
    },
    {
      productId: "2",
      name: "Köfte Menü",
      recommendation: "Öne çıkan ürün yaparak görünürlüğü artırabilirsiniz",
      expectedIncrease: 10,
    },
  ],
  financialHealth: {
    score: 8.5,
    status: "excellent",
    recommendations: [
      "3 aylık rezerv oluşturun",
      "Yüksek karlılığa sahip ürünlere odaklanın",
    ],
  },
};

// AI Hızlı Yanıtlar (Quick Replies)
export const aiQuickReplies = {
  dashboard: [
    "Satış tahmini göster",
    "En çok satan ürünler",
    "Müşteri memnuniyeti",
    "Stok durumu",
  ],
  customers: [
    "VIP müşteriler",
    "Churn risk analizi",
    "Müşteri segmentasyonu",
    "Yeni müşteri önerileri",
  ],
  products: [
    "Fiyat önerileri",
    "SEO önerileri",
    "Stok uyarıları",
    "Ürün açıklaması üret",
  ],
  cash: [
    "Nakit akışı",
    "Bütçe tahmini",
    "Risk analizi",
    "Finansal öneriler",
  ],
  reports: [
    "Trend analizi",
    "Karşılaştırmalı rapor",
    "Performans metrikleri",
    "Gelecek tahminleri",
  ],
  orders: [
    "Günlük tahmin",
    "En çok satan ürünler",
    "Sipariş önerileri",
    "Müşteri tercihleri",
  ],
};

// AI Context Detection için sayfa eşleştirmeleri
export const aiContextMap = {
  "/business/dashboard": "dashboard",
  "/business/customers": "customers",
  "/business/products": "products",
  "/business/cash": "cash",
  "/business/reports": "reports",
  "/business/orders": "orders",
  "/business/hr": "hr",
};

